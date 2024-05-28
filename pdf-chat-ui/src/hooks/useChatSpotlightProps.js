import { useCallback, useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

export function useChatSpotlightProps() {
  // const navigate = useNavigate();

  // const [version, setVersion] = useState(0);

  // useEffect(() => {
  //     const handleUpdate = () => setVersion(v => v + 1);
  //     chat.on('update', handleUpdate);
  //     return () => {
  //         chat.off('update', handleUpdate);
  //     };
  // }, [chat]);

  // const search = useCallback((query) => {
  //     return chat.searchChats(query)
  //         .map((result) => ({
  //             ...result,
  //             onTrigger: () => navigate(`/chat/${result.chatID}${result.messageID ? `#msg-${result.messageID}` : ''}`),
  //         }))
  // }, [chat, navigate, version]);

  const search = useCallback(() => {
    return [];
  }, []);

  const props = useMemo(
    () => ({
      shortcut: ["/"],
      overlayColor: "#000000",
      searchPlaceholder: "Search your chats",
      searchIcon: <i className="fa fa-search" />,
      actions: search,
      filter: (query, items) => items,
    }),
    [search]
  );

  return props;
}
