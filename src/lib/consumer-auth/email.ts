export type OneTimeCodeMessage = {
  email: string;
  code: string;
  expiresInMinutes: number;
};

export interface AuthEmailSender {
  sendOneTimeCode(message: OneTimeCodeMessage): Promise<void>;
}

type MailTransport = {
  sendMail(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<unknown>;
};

export class SmtpAuthEmailSender implements AuthEmailSender {
  constructor(
    private readonly from: string,
    private readonly transport: MailTransport,
  ) {}

  async sendOneTimeCode(message: OneTimeCodeMessage) {
    const text = [
      `Your Vox sign-in code is ${message.code}.`,
      `It expires in ${message.expiresInMinutes} minutes and can be used once.`,
      "If you did not request this code, you can ignore this email.",
    ].join("\n\n");
    await this.transport.sendMail({
      from: this.from,
      to: message.email,
      subject: "Your Vox sign-in code",
      text,
      html: `<p>Your Vox sign-in code is <strong>${message.code}</strong>.</p><p>It expires in ${message.expiresInMinutes} minutes and can be used once.</p><p>If you did not request this code, you can ignore this email.</p>`,
    });
  }
}

export class RecordingAuthEmailSender implements AuthEmailSender {
  private readonly messages = new Map<
    string,
    { code: string; expiresInMinutes: number }
  >();

  async sendOneTimeCode(message: OneTimeCodeMessage) {
    this.messages.set(message.email.trim().toLowerCase(), {
      code: message.code,
      expiresInMinutes: message.expiresInMinutes,
    });
  }

  latestFor(email: string) {
    return this.messages.get(email.trim().toLowerCase());
  }
}
