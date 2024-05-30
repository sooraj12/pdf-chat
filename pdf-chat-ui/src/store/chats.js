import { v4 as uuidv4 } from "uuid";
import { ChatManager } from "../core/chatManager";
import axios from "axios";

const chatsStore = (set, get) => ({
  chats: {
    activeChat: {
      msg: "",
      id: "",
      title: "",
      history: [],
      isLoading: true,
    },
    isLoading: true,
    history: [],
    activeId: "",
    generating: false,
    chatManager: new ChatManager(),

    setMessage: (msg) => {
      set((state) => {
        state.chats.activeChat.msg = msg;
      });
    },

    async sendMessage(msg, chatId) {
      const activeId = get().chats.activeId;
      const isNewChat = !activeId;

      const msgId = uuidv4();
      let replyId = uuidv4();

      if (isNewChat) {
        // set as active chat
        // set activeId
        // add msg to chat messages history
        // start getting reply
        // generate title with query and ans and then push to recent history
        set((state) => {
          state.chats.activeId = chatId;
          state.chats.activeChat = {
            msg: "",
            id: chatId,
            title: "Untitled Chat",
            history: [
              {
                id: msgId,
                role: "user",
                done: true,
                content: msg,
              },
              {
                id: replyId,
                role: "assistant",
                done: false,
                content: "",
              },
            ],
            isLoading: false,
          };
          state.chats.generating = true;
        });

        await get().chats.getReply(msg, replyId, chatId);
      } else {
        // add msg to active chat messages history
        // start getting reply
        set((state) => {
          state.chats.activeChat = {
            ...state.chats.activeChat,
            history: [
              ...state.chats.activeChat.history,
              {
                id: msgId,
                role: "user",
                done: true,
                content: msg,
              },
              {
                id: replyId,
                role: "assistant",
                done: false,
                content: "",
              },
            ],
            isLoading: false,
          };
          state.chats.generating = true;
        });

        await get().chats.getReply(msg, replyId, chatId);
      }
    },

    async getReply(msg, replyId, chatId) {
      try {
        const { data } = await axios({
          baseURL: "http://localhost:8086/pdf/generate",
          method: "POST",
          data: {
            question: msg,
            id: chatId,
          },
        });

        set((state) => {
          state.chats.activeChat.history = state.chats.activeChat.history.map(
            (msg) => {
              if (msg.id === replyId) {
                return {
                  ...msg,
                  content: data.answer,
                  done: true,
                  references: data.references,
                };
              }
              return msg;
            }
          );
          state.chats.generating = false;
        });

        // fetch chat history
        get().chats.fetchChatTitles();
      } catch (err) {
        console.log(err);
      }
    },

    async fetchChatTitles() {
      try {
        const { data } = await axios({
          baseURL: "http://localhost:8086/pdf/titles",
          method: "GET",
        });

        set((state) => {
          state.chats.history = data;
          state.chats.isLoading = false;
        });
      } catch (err) {
        console.log(err);
      }
    },

    async fetchChatHistory(id) {
      function splitChat(chat) {
        const userObj = {
          id: chat.id + id,
          role: "user",
          done: true,
          content: chat.question,
        };

        const assistantObj = {
          id: chat.id,
          role: "assistant",
          done: true,
          content: chat.answer,
          references: chat.references,
        };
        return [userObj, assistantObj];
      }

      try {
        const { data } = await axios({
          baseURL: "http://localhost:8086/pdf/history",
          method: "GET",
          params: {
            id,
          },
        });

        const title  = data[0].chats[0]?.question

        set((state) => {
          state.chats.activeId = id;
          state.chats.activeChat.title = title;
          state.chats.activeChat.history = data[0].chats.reduce((acc, cur) => {
            const chat = splitChat(cur);
            return [...acc, ...chat];
          }, []);
          state.chats.activeChat.isLoading = false;
          state.chats.activeChat.id = id
        });
      } catch (err) {
        console.log(err);
      }
    },

    resetActiveChat() {
      set((state) => {
        state.chats.activeId = "";
        state.chats.activeChat = {
          msg: "",
          id: "",
          title: "",
          history: [],
          isLoading: true,
        };
      });
    },

    getTitleFromQueryAndResult() {},
  },
});

export { chatsStore };
