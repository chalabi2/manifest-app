/* eslint-disable @next/next/no-img-element */
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChainWalletBase } from 'cosmos-kit';

export const WalletList = ({
  onClose,
  onWalletClicked,
  wallets,
}: {
  onClose: () => void;
  onWalletClicked: (name: string) => void;
  wallets: ChainWalletBase[];
}) => {
  const social = wallets.filter(wallet =>
    ['Google', 'Twitter', 'Apple', 'Discord'].includes(wallet.walletInfo.prettyName)
  );

  const browser = wallets.filter(wallet =>
    ['Keplr', 'Cosmostation', 'Leap', 'Station'].includes(wallet.walletInfo.prettyName)
  );

  const mobile = wallets.filter(wallet =>
    ['Wallet Connect', 'Keplr Mobile', 'Cosmostation Mobile', 'Leap Mobile'].includes(
      wallet.walletInfo.prettyName
    )
  );
  return (
    <div className="p-1 relative max-w-sm mx-auto">
      <h1 className="text-sm font-semibold text-center mb-6">Connect Wallet</h1>
      <button
        type="button"
        className="p-2 text-primary absolute -top-1 right-0 bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={onClose}
      >
        <XMarkIcon className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="space-y-2 mb-4">
        {browser.map(({ walletInfo: { name, prettyName, logo } }) => (
          <button
            key={name}
            onClick={() => onWalletClicked(name)}
            className="flex items-center w-full p-3 rounded-lg dark:bg-[#ffffff0c] bg-[#f0f0ff5c] dark:hover:bg-[#0000004c] hover:bg-[#a8a8a84c] transition"
          >
            <img src={logo?.toString()} alt={prettyName} className="w-10 h-10 rounded-xl mr-3" />
            <span className="text-md ">{prettyName}</span>
          </button>
        ))}
      </div>

      <div className="text-center mb-4 mt-3">
        <span className="">or connect with</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {social.map(({ walletInfo: { name, prettyName, logo } }) => (
          <button
            key={name}
            onClick={() => onWalletClicked(name)}
            className="flex items-center justify-center p-4 dark:bg-[#ffffff0c] bg-[#f0f0ff5c] dark:hover:bg-[#0000004c] hover:bg-[#a8a8a84c] rounded-lg transition"
          >
            <img
              src={logo?.toString()}
              alt={prettyName}
              className={`${prettyName === 'Twitter' || prettyName === 'Apple' ? 'w-7 h-7' : 'w-6 h-6'} rounded-md`}
            />
          </button>
        ))}
      </div>

      {/* Mobile Wallets Section (hidden on larger screens) */}
      <div className="md:hidden mt-6">
        <h4 className="font-medium text-left mb-3">Mobile Wallets</h4>
        <div className="grid grid-cols-2 gap-3">
          {mobile.map(({ walletInfo: { name, prettyName, logo } }) => (
            <button
              key={name}
              onClick={() => onWalletClicked(name)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-800 hover:bg-[rgba(255, 255, 255, 0.06)] transition"
            >
              <img src={logo?.toString()} alt={prettyName} className="w-10 h-10 rounded-md mb-2" />
              <p className="text-sm font-bold text-center">
                {prettyName === 'Twitter' ? 'X' : prettyName}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
