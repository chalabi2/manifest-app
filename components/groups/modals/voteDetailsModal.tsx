import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';

import {
  MemberSDKType,
  ProposalExecutorResult,
  ProposalSDKType,
  ProposalStatus,
  VoteOption,
  VoteSDKType,
  GroupInfoSDKType,
  ThresholdDecisionPolicySDKType,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import VotingPopup from './voteModal';
import { ApexOptions } from 'apexcharts';

import { useChain } from '@cosmos-kit/react';
import { useTx } from '@/hooks/useTx';
import { cosmos } from '@liftedinit/manifestjs';
import { useTheme } from '@/contexts/theme';
import CountdownTimer from '../components/CountdownTimer';
import {
  ExtendedGroupType,
  ExtendedQueryGroupsByMemberResponseSDKType,
  useFeeEstimation,
} from '@/hooks';

import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, CopyIcon } from '@/components/icons';
import env from '@/config/env';
import { messageSyntax } from '@/components';
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
}) as any;

SyntaxHighlighter.registerLanguage('json', json);

interface VoteMap {
  [key: string]: VoteOption;
}

interface VoteDetailsModalProps {
  tallies: QueryTallyResultResponseSDKType;
  votes: VoteSDKType[];
  members: MemberSDKType[];
  proposal: ProposalSDKType;
  showVoteModal: boolean;
  group: ExtendedGroupType;
  setShowVoteModal: (show: boolean) => void;
  onClose: () => void;
  refetchVotes: () => void;
  refetchTally: () => void;
  refetchProposals: () => void;
  refetchGroupInfo: () => void;
  refetchDenoms: () => void;
}

function VoteDetailsModal({
  tallies,
  votes,
  members,
  proposal,
  showVoteModal,
  setShowVoteModal,
  onClose,
  refetchVotes,
  refetchTally,
  refetchProposals,
  refetchGroupInfo,
  refetchDenoms,
}: VoteDetailsModalProps) {
  const voteMap = useMemo(
    () =>
      votes?.reduce<VoteMap>((acc, vote) => {
        const voterKey = vote?.voter?.toLowerCase().trim();
        acc[voterKey] = vote?.option;
        return acc;
      }, {}),
    [votes]
  );

  const { address } = useChain(env.chain);
  const { theme } = useTheme();

  const textColor = theme === 'dark' ? '#FFFFFF' : '#161616';

  const normalizedMembers = useMemo(
    () =>
      members?.map(member => ({
        ...member,
      })),
    [members]
  );

  const executorResultMapping: { [key: string]: string } = {
    PROPOSAL_EXECUTOR_RESULT_NOT_RUN: 'execute',
    PROPOSAL_EXECUTOR_RESULT_SUCCESS: 'success',
    PROPOSAL_EXECUTOR_RESULT_FAILURE: 'failed',
  };

  const votingStatusResultMapping: { [key: string]: string } = {
    PROPOSAL_STATUS_CLOSED: 'closed',
    PROPOSAL_STATUS_SUBMITTED: 'voting',
    PROPOSAL_STATUS_ABORTED: 'aborted',
    PROPOSAL_STATUS_ACCEPTED: 'accepted',
    PROPOSAL_STATUS_REJECTED: 'rejected',
  };

  const voteMapping: { [key: string]: string } = {
    VOTE_OPTION_YES: 'yes',
    VOTE_OPTION_NO: 'no',
    VOTE_OPTION_NO_WITH_VETO: 'veto',
    VOTE_OPTION_ABSTAIN: 'abstain',
  };

  const getStatusLabel = (proposal: any) => {
    if (proposal.executor_result === 'PROPOSAL_EXECUTOR_RESULT_NOT_RUN') {
      return votingStatusResultMapping[proposal.status] || 'unknown status';
    }

    return executorResultMapping[proposal.executor_result] || 'unknown status';
  };

  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const yesCount = parseInt(tallies?.tally?.yes_count ?? '0');
    const noCount = parseInt(tallies?.tally?.no_count ?? '0');
    const vetoCount = parseInt(tallies?.tally?.no_with_veto_count ?? '0');
    const abstainCount = parseInt(tallies?.tally?.abstain_count ?? '0');

    setChartData([yesCount, noCount, vetoCount, abstainCount]);
  }, [tallies, votes]);

  const options: ApexOptions = {
    chart: {
      type: 'bar',

      toolbar: {
        tools: {
          download: false,
        },
      },
    },
    legend: {
      labels: {
        useSeriesColors: true,
      },
      markers: {
        strokeWidth: 0,
      },
    },
    states: {
      normal: {
        filter: { type: 'none', value: 0 },
      },
      hover: {
        filter: { type: 'lighten', value: 0.2 },
      },
      active: {
        filter: { type: 'darken', value: 0.2 },
        allowMultipleDataPointsSelection: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    xaxis: {
      categories: ['Yes', 'No', 'Veto', 'Abstain'],
      labels: {
        style: {
          colors: textColor,
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: votes?.length,
      forceNiceScale: true,
      labels: {
        style: {
          colors: textColor,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    series: [
      {
        data: chartData,
      },
    ],
    colors: ['#4CAF50', '#E53935', '#FFB300', '#3F51B5'],
    tooltip: {
      enabled: false,
    },
  };
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const { exec } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { withdrawProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const msgExec = exec({
    proposalId: proposal?.id,
    executor: address ?? '',
  });

  const msgWithdraw = withdrawProposal({
    proposalId: proposal?.id,
    address: address ?? '',
  });

  const executeProposal = async () => {
    setIsSigning(true);
    try {
      const fee = await estimateFee(address ?? '', [msgExec]);
      await tx([msgExec], {
        fee,
        onSuccess: () => {
          setIsSigning(false);
          refetchTally();
          refetchVotes();
          refetchProposals();
          refetchGroupInfo();
          refetchDenoms();
        },
      });
      setIsSigning(false);
    } catch (error) {
      setIsSigning(false);
      console.error('Failed to execute proposal: ', error);
    }
  };

  const executeWithdrawl = async () => {
    setIsSigning(true);
    try {
      const fee = await estimateFee(address ?? '', [msgWithdraw]);
      await tx([msgWithdraw], {
        fee,
        onSuccess: () => {
          setIsSigning(false);
          refetchTally();
          refetchVotes();
          refetchProposals();
          refetchGroupInfo();
          refetchDenoms();
        },
      });
      setIsSigning(false);
    } catch (error) {
      setIsSigning(false);
      console.error('Failed to execute proposal: ', error);
    }
  };

  const optionToVote = (option: string) => {
    switch (option) {
      case 'VOTE_OPTION_YES':
        return 'Yes';
      case 'VOTE_OPTION_NO':
        return 'No';
      case 'VOTE_OPTION_NO_WITH_VETO':
        return 'Veto';
      case 'VOTE_OPTION_ABSTAIN':
        return 'Abstain';
      case undefined:
        return 'N/A';
      default:
        return 'Unknown';
    }
  };

  const [countdownValues, setCountdownValues] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const endTime = new Date(proposal?.voting_period_end);
  useEffect(() => {
    const calculateTimeParts = () => {
      const now = new Date();

      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const timeParts = calculateTimeParts();
    setCountdownValues(timeParts);

    const interval = setInterval(() => {
      const newTimeParts = calculateTimeParts();
      setCountdownValues(newTimeParts);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.voting_period_end]);

  const proposalClosed =
    countdownValues.days +
      countdownValues.hours +
      countdownValues.minutes +
      countdownValues.seconds ===
    0;

  const userHasVoted = votes?.some(vote => vote.voter.toLowerCase().trim() === address);

  const userVoteOption = userHasVoted
    ? votes?.find(vote => vote.voter.toLowerCase().trim() === address)?.option
    : null;

  const importantFields: { [key: string]: string[] } = {
    '/cosmos.bank.v1beta1.MsgSend': ['from_address', 'to_address', 'amount'],
    '/cosmos.group.v1.MsgCreateGroup': ['admin', 'members', 'metadata'],
    '/cosmos.group.v1.MsgUpdateGroupMembers': ['admin', 'group_id', 'member_updates'],
    '/cosmos.group.v1.MsgUpdateGroupAdmin': ['group_id', 'admin', 'new_admin'],
    '/cosmos.group.v1.MsgUpdateGroupMetadata': ['admin', 'group_id', 'metadata'],
    '/cosmos.group.v1.MsgCreateGroupPolicy': ['admin', 'group_id', 'metadata', 'decision_policy'],
    '/cosmos.group.v1.MsgCreateGroupWithPolicy': [
      'admin',
      'members',
      'group_metadata',
      'group_policy_metadata',
      'decision_policy',
    ],
    '/cosmos.group.v1.MsgSubmitProposal': [
      'group_policy_address',
      'proposers',
      'metadata',
      'messages',
    ],
    '/cosmos.group.v1.MsgVote': ['proposal_id', 'voter', 'option', 'metadata'],
    '/cosmos.group.v1.MsgExec': ['proposal_id', 'executor'],
    '/cosmos.group.v1.MsgLeaveGroup': ['address', 'group_id'],
    '/liftedinit.manifest.v1.MsgPayout': ['authority', 'payout_pairs'],
    '/liftedinit.manifest.v1.MsgBurnHeldBalance': ['authority', 'burn_coins'],
    '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy': ['group_id', 'decision_policy'],
    '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata': ['group_id', 'metadata'],
    '/osmosis.tokenfactory.v1beta1.MsgCreateDenom': ['subdenom'],
    '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata': ['metadata'],
    '/osmosis.tokenfactory.v1beta1.MsgMint': ['mint_to_address', 'amount'],
    '/osmosis.tokenfactory.v1beta1.MsgBurn': ['burn_from_address', 'amount'],
    // Add more message types and their important fields here
  };

  // Default fields to show if the message type is not in the mapping
  const defaultFields = ['@type'];

  const renderMessageField = (key: string, value: any, depth: number = 0): JSX.Element => {
    const truncateText = (text: string, maxLength: number = 30) => {
      if (text.length <= maxLength) return text;
      return `${text.substring(0, maxLength)}...`;
    };

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <h4 className="font-medium text-primary-content">{key}:</h4>
            {value.map((item, index) => (
              <div key={index} className="ml-4 text-primary-content">
                {renderMessageField(`Item ${index + 1}`, item, depth + 1)}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <h4 className="font-medium text-primary-content">{key}:</h4>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderMessageField(subKey, subValue, depth + 1)
            )}
          </div>
        );
      }
    } else {
      return (
        <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
          <h4 className="font-large text-md text-primary-content">{key}:</h4>
          {typeof value === 'string' && value.match(/^[a-zA-Z0-9]{40,}$/) ? (
            <TruncatedAddressWithCopy slice={14} address={value} />
          ) : (
            <p className="text-primary-content" title={String(value)}>
              {truncateText(String(value))}
            </p>
          )}
        </div>
      );
    }
  };

  const handleVoteButtonClick = () => {
    const voteModal = document.getElementById('vote_modal') as HTMLDialogElement;
    if (voteModal) {
      voteModal.showModal();
    }
  };

  const getButtonState = useMemo(() => {
    const isAccepted =
      proposal.status === ('PROPOSAL_STATUS_ACCEPTED' as unknown as ProposalStatus);
    const isRejected =
      proposal.status === ('PROPOSAL_STATUS_REJECTED' as unknown as ProposalStatus);
    const isNotRun =
      proposal.executor_result ===
      ('PROPOSAL_EXECUTOR_RESULT_NOT_RUN' as unknown as ProposalExecutorResult);
    const isFailure =
      proposal.executor_result ===
      ('PROPOSAL_EXECUTOR_RESULT_FAILURE' as unknown as ProposalExecutorResult);
    const isClosed = proposal?.status === ('PROPOSAL_STATUS_CLOSED' as unknown as ProposalStatus);
    const isProposer = proposal?.proposers?.includes(address ?? '');

    if ((isAccepted && isNotRun) || isFailure) {
      return { action: 'execute', label: 'Execute' };
    } else if (isNotRun && proposalClosed && !isRejected) {
      return { action: 'execute', label: 'Execute' };
    } else if (!isClosed && !proposalClosed && !userHasVoted) {
      return { action: 'vote', label: 'Vote' };
    } else if (
      (!isAccepted && isProposer) ||
      ((isRejected || userHasVoted) && !isAccepted && !isNotRun)
    ) {
      return { action: 'remove', label: 'Remove' };
    }
    return { action: null, label: null };
  }, [proposal, proposalClosed, userHasVoted, address]);

  const [copied, setCopied] = useState(false);

  const copyProposalLink = () => {
    const url = `${window.location.origin}/groups?policyAddress=${proposal?.group_policy_address}&proposalId=${proposal?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpandMessages = () => {
    const messagesModal = document.getElementById('messages_modal') as HTMLDialogElement;
    if (messagesModal) {
      messagesModal.showModal();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVoteModal) {
        e.stopPropagation();
        setShowVoteModal(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showVoteModal, setShowVoteModal, onClose]);

  const modalContent = (
    <dialog
      id="vote-details-modal"
      className={`modal ${showVoteModal ? 'modal-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: showVoteModal ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div
          className="modal-box relative max-w-4xl min-h-96 max-h-[80vh] overflow-y-auto md:overflow-y-hidden flex flex-col md:flex-row md:ml-20 -mt-12 rounded-[24px] shadow-lg bg-secondary transition-all duration-300"
          onClick={e => e.stopPropagation()}
          style={{ zIndex: 1002 }}
        >
          <form method="dialog" onSubmit={onClose}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A] z-50">
              ✕
            </button>
          </form>
          <div className="flex flex-col flex-grow w-full p-2 space-y-6">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-2 items-center">
                <p className="text-xl font-bold text-primary-content">
                  #{proposal?.id?.toString() ?? '0'}
                </p>
                <span className="badge badge-lg shadow-lg justify-center badge-primary text-neutral-content rounded-full">
                  {getStatusLabel(proposal)}
                </span>
              </div>
              {userHasVoted && (
                <div className="flex flex-row gap-2 justify-center items-center">
                  <span className="text-sm text-primary-content">Your vote:</span>
                  <span
                    className={`badge badge-lg rounded-full ${
                      userVoteOption?.toString() === 'VOTE_OPTION_YES'
                        ? 'bg-success'
                        : userVoteOption?.toString() === 'VOTE_OPTION_NO'
                          ? 'bg-error'
                          : userVoteOption?.toString() === 'VOTE_OPTION_NO_WITH_VETO'
                            ? 'bg-warning'
                            : userVoteOption?.toString() === 'VOTE_OPTION_ABSTAIN'
                              ? 'bg-info'
                              : ''
                    }`}
                  >
                    {userVoteOption !== null ? voteMapping[userVoteOption ?? ''] : null}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-start items-start">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">TITLE</p>
              <h1 className="text-2xl font-bold max-w-[20ch] truncate text-primary-content">
                {proposal?.title}
              </h1>
              <span className="text-sm font-light text-gray-500 dark:text-gray-400 mt-2">
                SUBMITTED
              </span>
              <span className="text-sm text-primary-content">
                {new Date(proposal?.submit_time).toDateString().toLocaleString()}
              </span>
            </div>
            <div className="divider my-"></div>
            {proposal?.summary && (
              <div className="w-full">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2 ">SUMMARY</p>
                <div className="bg-base-300 rounded-[12px] p-4">
                  <p className="text-sm text-primary-content">{proposal?.summary}</p>
                </div>
              </div>
            )}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">MESSAGES</p>
                <button
                  onClick={handleExpandMessages}
                  className="btn btn-xs btn-ghost btn-circle"
                  title="Expand messages"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>
              </div>
              <div
                className={`bg-base-300 rounded-[12px] p-4 overflow-y-auto max-w-[22rem] overflow-x-auto ${
                  proposal.summary ? 'max-h-[10rem]' : 'max-h-[17rem]'
                }`}
              >
                {proposal?.messages?.map((message: any, index: number) => {
                  const messageType = message['@type'];
                  const fieldsToShow = importantFields[messageType] || defaultFields;

                  return (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg font-semibold mb-2 text-primary-content">
                        {messageType.split('.').pop().replace('Msg', '')}
                      </h3>
                      <div className="font-mono">
                        <pre
                          className="whitespace-pre-wrap break-words bg-base-200 rounded-lg text-sm overflow-x-auto"
                          aria-label="message-json"
                        >
                          {messageSyntax(fieldsToShow, message, theme)}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div aria-label="voting-countdown-1" className="hidden md:block w-full">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                VOTING COUNTDOWN
              </p>
              <CountdownTimer endTime={new Date(proposal?.voting_period_end)} />
            </div>
            <div className="flex-row gap-2 items-center hidden md:flex mb-2">
              <button
                onClick={copyProposalLink}
                className="flex flex-row items-center gap-2 hover:bg-[#FFFFFFCC] dark:hover:bg-[#FFFFFF0F] p-2 rounded-full transition-colors duration-200"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  {copied ? 'Copied!' : 'Share this proposal'}
                </p>
              </button>
            </div>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="flex flex-col w-full relative flex-grow items-start justify-start p-6 space-y-6">
            <div className="w-full">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">TALLY</p>
              <div aria-label="chart-tally" className="bg-base-300 rounded-[12px] w-full">
                <Chart options={options} series={[{ data: chartData }]} type="bar" height={200} />
              </div>
            </div>
            <div className="w-full">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">MEMBERS</p>
              <div className="bg-base-300 rounded-[12px] p-4 w-full">
                <div className="overflow-x-auto w-full min-h-64 max-h-[22.5rem] overflow-y-auto">
                  <table className="table-auto w-full text-sm">
                    <thead className="text-xs uppercase bg-neutral">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 first:rounded-tl-[12px] text-primary-content"
                        >
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-primary-content">
                          Weight
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 last:rounded-tr-[12px] text-primary-content"
                        >
                          Vote
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedMembers?.map((member, index) => {
                        const memberVote = voteMap[member?.address];
                        return (
                          <tr key={index} className="border-b border-gray-500">
                            <td className="px-6 py-4">
                              <TruncatedAddressWithCopy slice={8} address={member?.address} />
                            </td>
                            <td className="px-6 py-4 text-primary-content">{member?.weight}</td>
                            <td className="px-6 py-4 text-primary-content">
                              {optionToVote(memberVote?.toString()) || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div aria-label="voting-countdown-2" className="md:hidden block w-full">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                VOTING COUNTDOWN
              </p>
              <CountdownTimer endTime={new Date(proposal.voting_period_end)} />
            </div>
            <div className="flex-row gap-2 items-center flex md:hidden mb-2">
              <button
                onClick={copyProposalLink}
                className="flex flex-row items-center gap-2 hover:bg-[#FFFFFFCC] dark:hover:bg-[#FFFFFF0F] p-2 rounded-full transition-colors duration-200"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  {copied ? 'Copied!' : 'Share this proposal'}
                </p>
              </button>
            </div>
            <div className="w-full relative">
              {getButtonState.action && (
                <button
                  aria-label="action-btn"
                  disabled={
                    isSigning ||
                    (getButtonState.action === 'remove' &&
                      !proposal?.proposers?.includes(address ?? ''))
                  }
                  className="btn w-full btn-gradient text-white rounded-[12px]"
                  onClick={() => {
                    switch (getButtonState.action) {
                      case 'execute':
                        executeProposal();
                        break;
                      case 'vote':
                        handleVoteButtonClick();
                        break;
                      case 'remove':
                        executeWithdrawl();
                        break;
                    }
                  }}
                >
                  {isSigning ? (
                    <div className="loading loading-dots loading-sm" />
                  ) : (
                    getButtonState.label
                  )}
                </button>
              )}
              {proposal?.proposers?.includes(address ?? '') &&
                proposal?.status !== ('PROPOSAL_STATUS_CLOSED' as unknown as ProposalStatus) &&
                !proposalClosed &&
                userHasVoted === false && (
                  <button
                    disabled={isSigning || !proposal?.proposers?.includes(address ?? '')}
                    className="btn btn-xs text-white btn-error absolute top-3 right-3 rounded-lg"
                    onClick={executeWithdrawl}
                  >
                    {isSigning ? (
                      <div className="loading loading-dots loading-sm" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
            </div>
            <dialog id="messages_modal" className="modal">
              <div className="modal-box max-w-4xl ml-20 bg-secondary">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    ✕
                  </button>
                </form>
                <h3 className="font-bold text-lg mb-4">Proposal Messages</h3>
                <div className="overflow-y-auto max-h-[60vh]">
                  {proposal?.messages?.map((message: any, index: number) => {
                    const messageType = message['@type'];
                    const fieldsToShow = importantFields[messageType] || defaultFields;

                    return (
                      <div key={index} className="mb-6 bg-base-300 p-4 rounded-[12px]">
                        <h3
                          aria-label="msg"
                          className="text-lg font-semibold mb-2 text-primary-content"
                        >
                          {messageType.split('.').pop().replace('Msg', '')}
                        </h3>
                        <div className="font-mono">
                          <pre
                            className="whitespace-pre-wrap break-words bg-base-200 p-4 rounded-lg text-sm overflow-x-auto"
                            aria-label="message-json-modal"
                          >
                            {messageSyntax(fieldsToShow, message, theme)}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <form
                method="dialog"
                className="modal-backdrop"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1001,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
                onClick={e => {
                  e.preventDefault();
                  setShowVoteModal(false);
                  onClose();
                }}
              >
                <button
                  onClick={e => {
                    e.preventDefault();
                    setShowVoteModal(false);
                    onClose();
                  }}
                >
                  close
                </button>
              </form>
            </dialog>
            <VotingPopup
              setIsSigning={setIsSigning}
              proposalId={proposal?.id ?? 0n}
              refetch={() => {
                refetchVotes();
                refetchTally();
                refetchProposals();
                refetchGroupInfo();
                refetchDenoms();
              }}
            />
          </div>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1001,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onClick={e => {
          e.preventDefault();
          setShowVoteModal(false);
          onClose();
        }}
      >
        <button>close</button>
      </form>
    </dialog>
  );

  if (typeof document !== 'undefined' && showVoteModal) {
    return createPortal(modalContent, document.body);
  }

  return null;
}

export default VoteDetailsModal;
