import React, { FC, useCallback } from 'react';
import { useParams } from 'react-router';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}

const InviteChannelModal: FC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { mutate: mutateMembers } = useSWR<IUser[]>(
    userData && channel ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );
  const { data: memberEmails } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  const membersEmail = memberEmails?.map((v) => v.email);

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;

      if (membersEmail !== undefined) {
        membersEmail?.forEach((v, i) => {
          if (userData && newMember === v) {
            Swal.fire({
              icon: 'error',
              text: '이미 채널에 존재하는 사용자입니다.',
            });
            return;
          }
        });

        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/members`, {
            email: newMember,
          })
          .then(() => {
            mutateMembers();
            setShowInviteChannelModal(false);
            setNewMember('');
          })
          .catch((error) => {
            console.dir(error);
            toast.error(error.response?.data, { position: 'bottom-center' });
          });
      }
    },
    [channel, newMember, mutateMembers, setNewMember, setShowInviteChannelModal, workspace],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>채널 멤버 초대</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;
