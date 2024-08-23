import {Chain} from "@chain-registry/types";
import {BondStatus, ParamsSDKType} from "@chalabi/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking";
import {ExtendedValidatorSDKType, TransactionGroup} from "@/components";
import {CombinedBalanceInfo} from "@/pages/bank";
import {ExtendedGroupType} from "@/hooks";

export const mockBalances: CombinedBalanceInfo[] = [
  {
    denom: "token1",
    coreDenom: "utoken1",
    amount: "1000",
    metadata: {
      description: "My First Token",
      name: "Token 1",
      symbol: "TK1",
      uri: "",
      uri_hash: "",
      display: "Token 1",
      base: "token1",
      denom_units: [{ denom: "utoken1", exponent: 0, aliases: ["utoken1"] }, { denom: "token1", exponent: 6, aliases: ["token1"] }],
    },
  },
  {
    denom: "token2",
    coreDenom: "utoken2",
    amount: "2000",
    metadata: {
      description: "My Second Token",
      name: "Token 2",
      symbol: "TK2",
      uri: "",
      uri_hash: "",
      display: "Token 2",
      base: "token2",
      denom_units: [{ denom: "utoken2", exponent: 0, aliases: ["utoken2"] }, { denom: "token2", exponent: 6, aliases: ["token2"] }],
    },
  },
];


export const mockActiveValidators: ExtendedValidatorSDKType[] = [
  {
    operator_address: "validator1",
    description: { moniker: "Validator One", identity: "identity1", details: "details1", website: "website1.com", security_contact: "security1" },
    consensus_power: BigInt(1000),
    logo_url: "",
    jailed: false,
    status: BondStatus.BOND_STATUS_BONDED,
    tokens: "1000upoa",
    delegator_shares: "1000",
    min_self_delegation: "1",
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: "0.1",
        max_rate: "0.2",
        max_change_rate: "0.01",
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
  {
    operator_address: "validator2",
    description: { moniker: "Validator Two", identity: "identity2", details: "details2", website: "website2.com", security_contact: "security2" },
    consensus_power: BigInt(2000),
    logo_url: "",
    jailed: false,
    status: BondStatus.BOND_STATUS_BONDED,
    tokens: "2000upoa",
    delegator_shares: "2000",
    min_self_delegation: "1",
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: "0.1",
        max_rate: "0.2",
        max_change_rate: "0.01",
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
];

export const mockPendingValidators: ExtendedValidatorSDKType[] = [
  {
    operator_address: "validator3",
    description: { moniker: "Validator Three", identity: "identity2", details: "details2", website: "website2.com", security_contact: "security2" },
    consensus_power: BigInt(3000),
    logo_url: "",
    jailed: false,
    status: BondStatus.BOND_STATUS_UNBONDED,
    tokens: "3000upoa",
    delegator_shares: "3000",
    min_self_delegation: "1",
    unbonding_height: 0n,
    unbonding_time: new Date(),
    commission: {
      commission_rates: {
        rate: "0.1",
        max_rate: "0.2",
        max_change_rate: "0.01",
      },
      update_time: new Date(),
    },
    unbonding_on_hold_ref_count: 0n,
    unbonding_ids: [],
  },
];

export const defaultAssetLists = [
  {
    chain_name: "manifest",
    assets: [
      {
        name: "Manifest Network Token",
        display: "umfx",
        base: "umfx",
        symbol: "umfx",
        denom_units: [
          { denom: "umfx", exponent: 0, aliases: ["umfx"] },
        ]
      }
    ],
  },
];

export const defaultChain: Chain = {
  chain_name: "manifest",
  chain_id: "manifest-1",
  status: "live",
  network_type: "testnet",
  pretty_name: "Manifest Network",
  bech32_prefix: "manifest",
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: "umfx",
        fixed_min_gas_price: 0.001,
        low_gas_price: 0.001,
        average_gas_price: 0.001,
        high_gas_price: 0.001,
      },
    ],
  },
}

export const mockTransactions: TransactionGroup[] = [
  {
    tx_hash: "hash1",
    block_number: 1,
    formatted_date: "2023-05-01T12:00:00Z",
    data: {
      from_address: "address1",
      to_address: "address2",
      amount: [{ amount: "1000000", denom: "utoken" }],
    },
  },
  {
    tx_hash: "hash2",
    block_number: 2,
    formatted_date: "2023-05-02T12:00:00Z",
    data: {
      from_address: "address2",
      to_address: "address1",
      amount: [{ amount: "2000000", denom: "utoken" }],
    },
  },
];

export const mockStakingParams: ParamsSDKType = {
  unbonding_time: { seconds: 86400n, nanos: 0 },
  max_validators: 100,
  bond_denom: "upoa",
  min_commission_rate: "0.05",
  max_entries: 7,
  historical_entries: 200,
};

// TODO: Not compatible with alpha.12 as poaParams is not defined in the current version
export const mockPoaParams = {
  admins: ["admin1"],
  allow_validator_self_exit: true,
};

export const mockGroup : ExtendedGroupType = {
  id: 1n,
  admin: "admin1",
  metadata: "metadata1",
  version: 1n,
  created_at: new Date(),
  ipfsMetadata: {
    title: "title1",
    summary: "summary1",
    details: "details1",
    authors: "author1",
    proposalForumURL: "forum1.com",
    voteOptionContext: "context1",
  },
  total_weight: "456",
  policies: ["policy1"],
  members: ["foo", "bar"],
};

