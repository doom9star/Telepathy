import React from "react";
import { useConvoContext, useGlobalContext } from "../context";
import { ConversationType } from "../ts/types";

export function useActiveConvo() {
  const {
    state: { user },
  } = useGlobalContext();
  const {
    state: { convos, activeID },
  } = useConvoContext();

  const convoProps = React.useMemo(
    () => (activeID ? convos[activeID] : null),
    [activeID, convos]
  );

  const isSolo = React.useMemo(
    () => convoProps?.convo.type === ConversationType.SOLO,
    [convoProps]
  );

  const imageURL = React.useMemo(() => {
    if (isSolo) {
      const participant = convoProps?.convo.participants.find(
        (p) => user?.id !== p.id
      );
      return participant?.avatar?.url ? participant.avatar.url : "/noImg.jpg";
    }
    return convoProps?.convo.thumbnail
      ? convoProps.convo.thumbnail.url
      : "/noThumbnail.png";
  }, [isSolo, user, convoProps]);

  const name = React.useMemo(() => {
    if (isSolo) {
      const participant = convoProps?.convo.participants.find(
        (p) => user?.id !== p.id
      );
      return participant?.username;
    }
    return convoProps?.convo.name;
  }, [isSolo, user, convoProps]);

  const date = React.useMemo(() => {
    if (!convoProps?.convo) return "";
    const _ = new Date(convoProps.convo.createdAt);
    return `${_.getDate()}/${_.getMonth() + 1}/${_.getFullYear()}`;
  }, [convoProps]);

  const isCreator = React.useMemo(
    () => convoProps?.convo.creator.id === user?.id,
    [convoProps, user]
  );

  const isAdmin = React.useMemo(
    () =>
      !isSolo &&
      convoProps?.convo.admins?.findIndex((aid) => aid === user?.id) !== -1,
    [user, isSolo, convoProps]
  );

  return {
    date,
    name,
    isSolo,
    isAdmin,
    imageURL,
    isCreator,
    convoProps,
  };
}
