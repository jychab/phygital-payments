/** Client wire types — re-export the shared module used by the worker too. */

export type {
  BytesBase64,
  Secp256r1VerifyEntryWire,
  TransferAccountsWire,
  SubmitTransferRequest,
  JobStatus,
  SponsoredJob,
  TransferJob,
  JobStatusResponse,
} from "../../../shared/submitter-wire";
