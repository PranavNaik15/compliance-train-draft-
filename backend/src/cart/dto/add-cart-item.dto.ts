export class AddCartItemDto {
  itemType: 'live_webinar' | 'recorded_webinar' | 'dvd' | 'flash_drive' | 'membership';
  productId: string;
  optionType?: string;
  quantity?: number;
  webinarId?: string;
  membershipId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
}
