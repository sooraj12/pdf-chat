import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { sidebarStore } from "./sidebar";
import { settingsStore } from "./settings";
import { chatsStore } from "./chats";
import { configStore } from "./config";

const useGlobalStore = create(
  devtools(
    immer((...utils) => ({
      ...sidebarStore(...utils),
      ...settingsStore(...utils),
      ...chatsStore(...utils),
      ...configStore(...utils),
    }))
  )
);

export { useGlobalStore };
