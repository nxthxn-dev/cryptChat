"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  listenToChatMessages,
  getChatMessages,
  sendMessage,
} from "@/lib/firebase/firestore";
import { decryptWithCryptoJS } from "@/lib/crypto/utils"; // Import the compatible decryption function
import Header from "@/components/layout/header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { db } from "@/lib/firebase/config";
import {
  decryptMessage,
  decryptWithAES,
  encryptMessage,
  verifySignature,
} from "@/lib/crypto/signature";
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
export default function Chat() {
  const { chatId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [senderPublicKey, setSenderPublicKey] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    let rPublicKey = "";
    let sPublicKey = "";
    const fetchData = async () => {
      try {
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (chatDoc.exists()) {
          const data = chatDoc.data();
          setChatData(data);

          const otherParticipant = data.participants.find(
            (email) => email !== user.email
          );
          setRecipientEmail(otherParticipant || "Unknown");

          if (!recipientPublicKey) {
            const usersQuery = query(
              collection(db, "users"),
              where("email", "==", otherParticipant)
            );
            const usersSnapshot = await getDocs(usersQuery);
            console.log("USERS SNAPSHOT", usersSnapshot);
            if (usersSnapshot.empty) {
              console.error("Recipient not found");
              return;
            }

            // Get recipient's public key
            const recipientData = usersSnapshot.docs[0].data();
            console.log("RECIPIENT DATA", recipientData);
            setRecipientPublicKey(recipientData.publicKey);
          }

          if (!senderPublicKey) {
            const usersQuery = query(
              collection(db, "users"),
              where("email", "==", user.email)
            );
            const usersSnapshot = await getDocs(usersQuery);
            console.log("USERS SNAPSHOT", usersSnapshot);
            if (usersSnapshot.empty) {
              console.error("Sender not found");
              return;
            }

            // Get recipient's public key
            const senderData = usersSnapshot.docs[0].data();
            console.log("SENDER DATA", senderData);
            setSenderPublicKey(senderData.publicKey);
            sPublicKey = senderData.publicKey;
          }

          return;
        } else {
          console.error("Chat not found");
          router.push("/chats");
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();

    const unsubscribe = listenToChatMessages(chatId, (updatedMessages) => {
      if (!recipientPublicKey) return;
      // For this CryptoJS implementation, we need to use the user's email as the private key
      // This matches how you're encrypting in the sendMessage function

      const decryptedMessages = updatedMessages.map((message) => {
        try {
          // Step 1: Determine if the user is the sender or recipient
          const encryptedAES =
            message.recipient === user.email
              ? message.recipientAES
              : message.senderAES;

          // Step 2: Decrypt the AES key using the user's private key
          // const aesKey = decryptMessage(encryptedAES, localStorage.getItem('privateKey'));

          // Step 3: Decrypt the message using AES
          const decryptedText = decryptWithAES(
            message.text,
            encryptedAES,
            localStorage.getItem("privateKey")
          );

          // Step 4: Verify the sender's signature
          let isValidSignature = true;
          if (message.recipient === user.email) {
            isValidSignature = verifySignature(
              decryptedText,
              message.signature,
              recipientPublicKey
            );
          }
          if (!isValidSignature) {
            console.error(
              "Signature verification failed! Message may be tampered with."
            );
            return {
              ...message,
              text: "[Invalid Signature]",
              decrypted: false,
            };
          }

          return { ...message, text: decryptedText, decrypted: true };
        } catch (error) {
          console.error("Error decrypting message:", error);
          return { ...message, decryptionFailed: true };
        }
      });

      setMessages(decryptedMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, user, loading, router, recipientPublicKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    try {
      // Query the users collection to find the recipient by email
      if (!recipientPublicKey) {
        console.error("Recipient does not have a public key");
        return;
      }

      // Encrypt the message using the recipient's public key
      //   const encryptedMessage = encryptMessage(text, recipientPublicKey);
      console.log("USER PRIVATE KEY", user);
      await sendMessage(
        chatId,
        user.email,
        recipientEmail,
        text,
        localStorage.getItem("privateKey"),
        recipientPublicKey,
        senderPublicKey
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse text-lg">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header recipientEmail={recipientEmail} showBackButton={true} />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          <MessageList messages={messages} currentUserEmail={user?.email} />
          <div ref={messagesEndRef} />
        </div>

        <MessageInput onSendMessage={handleSendMessage} />
      </main>
    </div>
  );
}
