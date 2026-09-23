export class SubscribeMembershipDto {
  membershipId: string;
  planId: string;
  companyName?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
}
