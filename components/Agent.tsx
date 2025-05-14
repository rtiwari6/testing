"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
                 userName,
                 userId,
                 interviewId,
                 feedbackId,
                 type,
                 questions,
               }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<"ai" | "user" | null>(null);
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        setLastMessage(message.transcript);
        setActiveSpeaker(message.role === "user" ? "user" : "ai");

        // Reset speaker after brief pause
        setTimeout(() => {
          setActiveSpeaker((prev) => (prev === (message.role === "user" ? "user" : "ai") ? null : prev));
        }, 1000);
      }
    };

    const onSpeechStart = () => setActiveSpeaker("ai");
    const onSpeechEnd = () => setActiveSpeaker(null);

    const onUserSpeechStart = () => setActiveSpeaker("user");
    const onUserSpeechEnd = () => setActiveSpeaker(null);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("user-speech-start", onUserSpeechStart);
    vapi.on("user-speech-end", onUserSpeechEnd);
    vapi.on("error", (error) => console.error("VAPI error:", error));

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("user-speech-start", onUserSpeechStart);
      vapi.off("user-speech-end", onUserSpeechEnd);
      vapi.off("error", (error) => console.error("VAPI error:", error));
      vapi.stop();
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else if (interviewId) {
        createFeedback({
          interviewId,
          userId: userId!,
          transcript: messages,
          feedbackId,
        }).then(({ success, feedbackId: newId }) => {
          router.push(
              success && newId
                  ? `/interview/${interviewId}/feedback`
                  : "/"
          );
        });
      }
    }
  }, [callStatus, type, router, interviewId, userId, messages, feedbackId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: { username: userName, userid: userId },
        });
      } else {
        const formattedQuestions = questions?.map((q) => `- ${q}`).join("\n") || "";
        await vapi.start(interviewer, {
          variableValues: { questions: formattedQuestions },
        });
      }
    } catch (error) {
      console.error("Call start failed:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleBack = () => {
    vapi.stop();
    router.back();
  };

  return (
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="call-view">
          {/* AI Interviewer Card */}
          <div className="card-interviewer">
            <div className="relative">
              <div className="avatar">
                <Image
                    src="/logo.png"
                    alt="AI Interviewer"
                    width={120}
                    height={120}
                    className="object-cover rounded-full z-10"
                />
                {activeSpeaker === "ai" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary-100/30 animate-ping opacity-75" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-pulse" />
                    </>
                )}
              </div>
              <h3>MOCKLY AI</h3>
            </div>
          </div>

          {/* User Card */}
          <div className="card-border">
            <div className="card-content">
              <div className="relative">
                <div className="avatar">
                  <Image
                      src="/user-avatar.png"
                      alt="User Avatar"
                      width={120}
                      height={120}
                      className="object-cover rounded-full z-10"
                  />
                  {activeSpeaker === "user" && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-success-100/30 animate-ping opacity-75" />
                        <div className="absolute inset-0 rounded-full border-4 border-success-100 animate-pulse" />
                      </>
                  )}
                </div>
                <h3>{userName}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Display */}
        {lastMessage && (
            <div className="transcript-border w-full max-w-2xl">
              <div className="transcript">
                <p
                    key={lastMessage}
                    className={cn(
                        "text-lg text-center",
                        "animate-fadeIn"
                    )}
                >
                  {lastMessage}
                </p>
              </div>
            </div>
        )}

        {/* Call Controls */}
        <div className="flex gap-4 w-full justify-center">
          {callStatus === CallStatus.INACTIVE && (
              <button
                  onClick={handleBack}
                  className="btn-secondary px-6 py-3"
              >
                ← Back
              </button>
          )}

          {callStatus !== CallStatus.ACTIVE ? (
              <button
                  className="relative btn-call"
                  onClick={handleCall}
                  disabled={callStatus === CallStatus.CONNECTING}
              >
            <span
                className={cn(
                    "absolute inset-0 rounded-full bg-primary-100 animate-ping opacity-75",
                    callStatus !== CallStatus.CONNECTING && "hidden"
                )}
            />
                <span className="relative z-10">
              {callStatus === CallStatus.INACTIVE ? "Start Call" : "Connecting..."}
            </span>
              </button>
          ) : (
              <button
                  className="btn-disconnect"
                  onClick={handleDisconnect}
              >
                End Call
              </button>
          )}
        </div>
      </div>
  );
};

export default Agent;