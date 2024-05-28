import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { Loader } from "@mantine/core";
import { useGlobalStore } from "../store/useGlobalStore";
import { useShallow } from "zustand/react/shallow";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  margin: calc(1.618rem - 1rem);
  margin-top: -0.218rem;
`;

const Empty = styled.p`
  text-align: center;
  font-size: 0.8rem;
  padding: 2rem;
`;

const ChatList = styled.div``;

const ChatListItemLink = styled(Link)`
  display: block;
  position: relative;
  padding: 0.4rem 1rem;
  margin: 0.218rem 0;
  line-height: 1.7;
  text-decoration: none;
  border-radius: 0.25rem;

  &:hover,
  &:focus,
  &:active {
    background: rgba(0, 0, 0, 0.1);
  }

  &.selected {
    background: #2b3d54;
  }

  strong {
    display: block;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.6;
    padding-right: 1rem;
    color: white;
  }

  p {
    font-size: 0.8rem;
    font-weight: 200;
    opacity: 0.8;
  }

  .mantine-ActionIcon-root {
    position: absolute;
    right: 0rem;
    top: 50%;
    margin-top: -22px;
    opacity: 0;
  }

  &:hover {
    .mantine-ActionIcon-root {
      opacity: 1;
    }

`;

function ChatListItem({ chat, onClick, selected }) {
  const c = chat;

  return (
    <ChatListItemLink
      data-chat-id={c.chatID}
      className={selected ? "selected" : ""}
      onClick={onClick}
    >
      <div className="Chat__item">
        <strong>{c.title || "Untitled"}</strong>
      </div>
    </ChatListItemLink>
  );
}

function RecentChats() {
  const { activeId, recentChats, isLoading } = useGlobalStore(
    useShallow((state) => ({
      activeId: state.chats.activeId,
      recentChats: state.chats.history,
      isLoading: state.chats.isLoading,
    }))
  );
  const navigate = useNavigate();
  return (
    <Container>
      {isLoading ? (
        <Empty>
          <Loader size="sm" variant="dots" />
        </Empty>
      ) : (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          {recentChats && recentChats.length > 0 ? (
            <ChatList>
              {recentChats.map((c) => (
                <ChatListItem
                  key={c._id}
                  chat={c}
                  onClick={() => navigate(`/chat/${c._id}`)}
                  selected={c._id === activeId}
                />
              ))}
            </ChatList>
          ) : (
            <div>No Previous Chats</div>
          )}
        </div>
      )}
    </Container>
  );
}

export { RecentChats };
