import React, { FC, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import Modal from '@components/Modal';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}

const InviteWorkspaceModal: FC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { mutate: mutateMember } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );
  const { data: memberEmails } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  const membersEmail = memberEmails?.map((v) => v.email);

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return; // 인풋창 검사

      if (membersEmail !== undefined) {
        membersEmail?.forEach((v, i) => {
          if (userData && newMember === v) {
            Swal.fire({
              icon: 'error',
              text: '이미 워크스페이스에 존재하는 사용자입니다.',
            });
            return;
          }
        });

        axios
          .post(`/api/workspaces/${workspace}/members`, {
            email: newMember,
          })
          .then(() => {
            mutateMember();
            setShowInviteWorkspaceModal(false);
            setNewMember('');
          })
          .catch((error) => {
            console.dir(error);
            toast.error(error.response?.data, { position: 'bottom-center' });
          });
      }
    },
    [newMember, workspace, mutateMember, setShowInviteWorkspaceModal, setNewMember],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;
