import styled from "@emotion/styled";
import { ActionIcon, Avatar, Burger, Menu } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useCallback } from "react";
import { RecentChats } from "./RecentChats";
import { useGlobalStore } from "../store/useGlobalStore";
import { useShallow } from "zustand/react/shallow";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;

  font-family: "Work Sans", sans-serif;
  box-shadow: 0px 0px 1rem 0.2rem rgb(0 0 0 / 5%);

  .sidebar-header {
    padding: 0.5rem 1rem 0.5rem 1.618rem;
    min-height: 2.618rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      font-size: 1rem;
      font-weight: bold;
    }
  }

  .sidebar-content {
    flex-grow: 1;
    overflow-y: auto;

    /* hide scrollbars */
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    min-width: 20vw;

    padding-bottom: 2rem;
  }

  .sidebar-footer {
    border-top: thin solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1.118rem;
    padding-left: 0.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    font-size: 1rem;
    cursor: pointer;

    .user-info {
      max-width: calc(100% - 1.618rem * 2 - 2.5rem);
      margin-right: 0.5rem;
    }

    strong,
    span {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    strong {
      font-weight: bold;
      margin-bottom: 0.2rem;
    }

    span {
      font-size: 0.8rem;
      font-weight: 100;
    }

    .mantine-Avatar-root {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      overflow: hidden;
      width: 2.5rem;
      height: 2.5rem;
      min-width: 0;
      flex-grow: 0;
      flex-shrink: 0;
      margin: 0.5rem;
    }
  }

  .spacer {
    flex-grow: 1;
  }
`;

function Sidebar() {
  const { sidebarOpen, toggleSidebar, setTab } = useGlobalStore(
    useShallow((state) => ({
      sidebarOpen: state.sidebar.open,
      toggleSidebar: state.sidebar.toggleSidebar,
      setTab: state.settings.setTab,
    }))
  );

  const onBurgerClick = useCallback(() => toggleSidebar(), [toggleSidebar]);

  const { ref, width } = useElementSize();

  const burgerLabel = sidebarOpen ? "Close sidebar" : "Open sidebar";

  return (
    <Container
      className={"sidebar " + (sidebarOpen ? "opened" : "closed")}
      ref={ref}
    >
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <Burger
          opened={sidebarOpen}
          onClick={onBurgerClick}
          aria-label={burgerLabel}
          transitionDuration={0}
        />
      </div>
      <div className="sidebar-content">
        <RecentChats />
      </div>
      <Menu width={width - 20}>
        <Menu.Target>
          <div className="sidebar-footer">
            <Avatar size="lg" />
            <div className="spacer" />

            <ActionIcon variant="subtle">
              <i className="fas fa-ellipsis" />
            </ActionIcon>
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => {
              setTab("user");
            }}
            icon={<i className="fas fa-gear" />}
          >
            User settings
          </Menu.Item>

          <Menu.Divider />
          <Menu.Item
            color="green"
            onClick={(e) => e.stopPropagation()}
            icon={<i className="fas fa-sign-out-alt" />}
          >
            Sign In
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Container>
  );
}

export { Sidebar };
