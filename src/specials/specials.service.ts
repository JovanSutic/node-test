import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import MailerLite, {
  type SubscriberObject,
} from "@mailerlite/mailerlite-nodejs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SpecialsService {
  private readonly mailerLite: MailerLite;
  constructor(private readonly configService: ConfigService) {
    const mailerToken = this.configService.get<string>("MAILER_LITE_API_TOKEN");

    if (!mailerToken) {
      console.error(
        "MAILER_LITE_API_TOKEN is not defined in the environment variables."
      );
      throw new Error("MailerLite API Key is missing.");
    }

    this.mailerLite = new MailerLite({
      api_key: mailerToken,
    });
  }

  async createNewsletterSub(email: string) {
    let sub: SubscriberObject | null = null;
    let isSub = false;

    try {
      const subscriber = await this.mailerLite.subscribers.find(email);
      if (subscriber) {
        sub = subscriber.data.data;

        sub.groups?.map((item) => {
          if (item.id === "156739726714340409") {
            isSub = true;
          }
        });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log("404");
      } else {
        throw new BadRequestException(
          error.message ||
            "An error occurred while finding email in the mailer lite database."
        );
      }
    }

    if (sub && isSub) {
      throw new ConflictException(
        `Subscriber with email '${email}' already exists.`
      );
    }

    try {
      let res = null;
      if (sub) {
        const update = await this.mailerLite.subscribers.update(sub.id, {
          groups: ["156739726714340409"],
        });
        res = update.data.data.id;
      } else {
        const create = await this.mailerLite.subscribers.createOrUpdate({
          email,
          status: "unconfirmed",
          groups: ["156739726714340409"],
        });

        res = create.data.data.id;
      }

      return { success: true, id: res };
    } catch (error: any) {
      if (
        (error.response && error.response.status === 422) ||
        error.response.data?.errors?.email?.[0]?.includes("unsubscribed")
      ) {
        throw new BadRequestException(
          `Subscriber with email '${email}' was previously unsubscribed and cannot be re-added via this method. Please use a MailerLite form to re-subscribe or contact support.`
        );
      }
      throw new BadRequestException(
        error.message ||
          `An error occurred while ${
            sub ? "updating" : "creating"
          } mailer lite subscriber`
      );
    }
  }
}
