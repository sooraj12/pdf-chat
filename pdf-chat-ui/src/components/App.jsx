import React, { useEffect } from "react";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ChatPage } from "./pages/ChatPage";
import { LandingPage } from "./pages/LandingPage";
import { useGlobalStore } from "../store/useGlobalStore";
import { useShallow } from "zustand/react/shallow";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage landing={true} />,
  },
  {
    path: "/chat/:id",
    element: <ChatPage />,
  },
], {basename: "/pdfchat"});

function App() {
  const { fetchChatTitles } = useGlobalStore(
    useShallow((state) => ({
      fetchChatTitles: state.chats.fetchChatTitles,
    }))
  );

  useEffect(() => {
    fetchChatTitles();
  }, [fetchChatTitles]);

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <ModalsProvider>
        <RouterProvider router={router} />
      </ModalsProvider>
    </MantineProvider>
  );
}

export { App };
