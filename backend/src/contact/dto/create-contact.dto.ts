export class CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  queryType?: string;
  subject?: string;
  message: string;
}
