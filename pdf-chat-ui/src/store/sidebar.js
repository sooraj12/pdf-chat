const sidebarStore = (set) => ({
  sidebar: {
    open: false,

    openSidebar() {
      set((state) => {
        state.sidebar.open = true;
      });
    },

    closeSidebar() {
      set((state) => {
        state.sidebar.open = false;
      });
    },

    toggleSidebar() {
      set((state) => {
        state.sidebar.open = !state.sidebar.open;
      });
    },
  },
});

export { sidebarStore };
