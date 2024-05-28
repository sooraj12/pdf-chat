import styled from "@emotion/styled";
import { Button, ActionIcon, Textarea, Loader } from "@mantine/core";
import { getHotkeyHandler, useHotkeys, useMediaQuery } from "@mantine/hooks";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOption } from "../hooks";
import { useGlobalStore } from "../store/useGlobalStore";
import { useShallow } from "zustand/react/shallow";
import { v4 as uuidv4 } from "uuid";

const Container = styled.div`
  background: #292933;
  border-top: thin solid #393933;
  padding: 1rem 1rem 0.5rem 1rem;

  .inner {
    max-width: 50rem;
    margin: auto;
    text-align: right;
  }

  .settings-button {
    margin: 0.5rem -0.4rem 0.5rem 1rem;
    font-size: 0.7rem;
    color: #999;
  }
`;

function MessageInput(props) {
  const { setMessage, message, sendMessage, generating, activeId } =
    useGlobalStore(
      useShallow((state) => ({
        setMessage: state.chats.setMessage,
        message: state.chats.activeChat.msg,
        sendMessage: state.chats.sendMessage,
        generating: state.chats.generating,
        activeId: state.chats.activeId,
      }))
    );
  const location = useLocation();
  const isHome = location.pathname === "/";

  const hasVerticalSpace = useMediaQuery("(min-height: 1000px)");

  const navigate = useNavigate();

  const [submitOnEnter] = useOption("input", "submit-on-enter");

  const onChange = useCallback(
    (e) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  const onSubmit = useCallback(async () => {
    if (!message?.trim().length) {
      return false;
    }

    const chatId = activeId ? activeId : uuidv4();

    if (!location.pathname.includes(chatId)) {
      navigate("/chat/" + chatId);
    }
    setMessage("");

    await sendMessage(message, chatId);
  }, [message, navigate, location.pathname, setMessage, sendMessage, activeId]);

  useHotkeys([["c", () => document.querySelector("#message-input")?.focus()]]);

  const blur = useCallback(() => {
    document.querySelector("#message-input")?.blur();
  }, []);

  const rightSection = useMemo(() => {
    return (
      <div
        style={{
          opacity: "0.8",
          paddingRight: "0.5rem",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
        }}
      >
        {generating && (
          <>
            <Button variant="subtle" size="xs" compact onClick={() => {}}>
              Cancel
            </Button>
            <Loader size="xs" style={{ padding: "0 0.8rem 0 0.5rem" }} />
          </>
        )}
        {!generating && (
          <>
            <ActionIcon size="xl" onClick={onSubmit}>
              <i className="fa fa-paper-plane" style={{ fontSize: "90%" }} />
            </ActionIcon>
          </>
        )}
      </div>
    );
  }, [onSubmit, generating]);

  const hotkeyHandler = useMemo(() => {
    const keys = [
      ["Escape", blur, { preventDefault: true }],
      ["ctrl+Enter", onSubmit, { preventDefault: true }],
    ];
    if (submitOnEnter) {
      keys.unshift(["Enter", onSubmit, { preventDefault: true }]);
    }
    const handler = getHotkeyHandler(keys);
    return handler;
  }, [onSubmit, blur, submitOnEnter]);

  return (
    <Container>
      <div className="inner">
        <Textarea
          disabled={props.disabled || generating}
          id="message-input"
          autosize
          minRows={hasVerticalSpace || isHome ? 3 : 2}
          maxRows={12}
          placeholder={"Ask a question..."}
          value={message}
          onChange={onChange}
          rightSection={rightSection}
          rightSectionWidth={generating ? 100 : 55}
          onKeyDown={hotkeyHandler}
        />
      </div>
    </Container>
  );
}

export { MessageInput };
