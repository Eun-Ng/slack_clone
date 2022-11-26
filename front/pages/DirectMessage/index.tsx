import React from 'react';
import { Container, Header } from '@pages/DirectMessage/styles';
import gravatar from 'gravatar';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const DirectMessage = () => {
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/members/${id}`, fetcher);

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
    </Container>
  );
};

export default DirectMessage;
