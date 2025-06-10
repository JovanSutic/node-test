import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SpecialsService } from "./specials.service";

@Controller("specials")
@ApiTags("specials")
export class SpecialsController {
  constructor(private readonly specialsService: SpecialsService) {}

  @Post("subscriber")
  async createSubscriber(@Body("email") email: string) {
    try {
      return await this.specialsService.createNewsletterSub(email);
    } catch (error: any) {
      throw error;
    }
  }
}
