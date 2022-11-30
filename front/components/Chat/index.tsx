import { IDM } from '@typings/db';
import React, { VFC } from 'react';
import { ChatWrapper } from '@components/Chat/styles';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import workspace from '@layouts/Workspace';
import channel from '@pages/Channel';

interface Props {
  data: IDM;
}

const Chat: VFC<Props> = ({ data }) => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const user = data.Sender;

  const result = regexifyString({
    pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
    decorator(match, index) {
      const arr = match.match(/@\[(.+?)]\((\d+?)\)/)!;
      if (arr) {
        return (
          <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
            @{arr[1]}
          </Link>
        );
      }
      return <br key={index} />;
    },
    input: data.content,
  });

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default Chat;
