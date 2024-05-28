import React, { Suspense, useCallback } from "react";
import styled from "@emotion/styled";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "@mantine/core";
import { useOption } from "../../hooks";
import { Page } from "../Page";
import { Message } from "../Message";
import { useGlobalStore } from "../../store/useGlobalStore";
import { useShallow } from "zustand/react/shallow";

const Messages = styled.div`
  @media (min-height: 30em) {
    max-height: 100%;
    flex-grow: 1;
    overflow-y: auto;
  }
  display: flex;
  flex-direction: column;
`;

const EmptyMessage = styled.div`
  flex-grow: 1;
  padding-bottom: 5vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Work Sans", sans-serif;
  line-height: 1.7;
  gap: 1rem;
  min-height: 10rem;
`;

function ChatPage() {
  const { id } = useParams();
  const { activeChat, generating, fetchChatHistory, resetActiveChat } =
    useGlobalStore(
      useShallow((state) => ({
        activeChat: state.chats.activeChat,
        generating: state.chats.generating,
        fetchChatHistory: state.chats.fetchChatHistory,
        resetActiveChat: state.chats.resetActiveChat,
      }))
    );

  useEffect(() => {
    if (id) fetchChatHistory(id);

    return () => {
      // clear active chat
      resetActiveChat();
    };
  }, [id, fetchChatHistory, resetActiveChat]);

  const [autoScrollWhenOpeningChat] = useOption(
    "auto-scroll",
    "auto-scroll-when-opening-chat"
  );
  const [autoScrollWhileGenerating] = useOption(
    "auto-scroll",
    "auto-scroll-while-generating"
  );

  useEffect(() => {
    const shouldScroll = autoScrollWhenOpeningChat;

    if (!shouldScroll) {
      return;
    }

    const container = document.querySelector("#messages");
    const messages = document.querySelectorAll("#messages .message");

    if (messages.length && activeChat) {
      const latest = messages[messages.length - 1];
      const offset = Math.max(0, latest.offsetTop - 100);
      setTimeout(() => {
        container?.scrollTo({ top: offset, behavior: "smooth" });
      }, 100);
    }
  }, [autoScrollWhenOpeningChat, activeChat]);

  const autoScroll = useCallback(() => {
    if (generating && autoScrollWhileGenerating) {
      const container = document.querySelector("#messages");
      container?.scrollTo({ top: 999999, behavior: "smooth" });
      container?.parentElement?.scrollTo({ top: 999999, behavior: "smooth" });
    }
  }, [generating, autoScrollWhileGenerating]);

  useEffect(() => {
    const timer = setInterval(() => autoScroll(), 1000);
    return () => {
      clearInterval(timer);
    };
  }, [autoScroll]);

  return (
    <Page
      id={id || "landing"}
      headerProps={{
        title: activeChat.title,
      }}
    >
      <Suspense
        fallback={
          <Messages id="messages">
            <EmptyMessage>
              <Loader variant="dots" />
            </EmptyMessage>
          </Messages>
        }
      >
        <Messages id="messages">
          {!activeChat.isLoading && (
            <div style={{ paddingBottom: "4.5rem" }}>
              {activeChat.history.map((message, i) => (
                <Message
                  key={id + ":" + message.id}
                  message={message}
                  last={i === activeChat.history.length - 1}
                />
              ))}
            </div>
          )}
          {activeChat.isLoading && (
            <EmptyMessage>
              <Loader variant="dots" />
            </EmptyMessage>
          )}
        </Messages>
      </Suspense>
    </Page>
  );
}

export { ChatPage };
