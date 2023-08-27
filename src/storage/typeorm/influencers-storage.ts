// import { PrismaClient } from "@prisma/client";
// // import { CreateInfluencersDto } from "./entity/influencers.entity.js";
import { DataSource } from "typeorm";
import BadRequestError from "../../error/bad-request-error.js";
import { InfluencerEntity } from "./entity/influencers.entity.js";

export class InfluencerStorateService {
  constructor(private readonly log: any, private readonly client: DataSource) { }
  async createMany(data: InfluencerEntity[]) {
    try {
      this.log.info(`create influencers with ${JSON.stringify(data)}`)
      return await this.client.transaction(async manager => {
        // for (const entity of data) {
        //   await manager.save(entity)
        // }
        const trans = data.map(async entity => {
          const influencer = new InfluencerEntity()
          await manager.save(Object.assign(influencer, entity))
        })
        await Promise.all(trans)
      })

    } catch (error) {
      this.log.error(error)
      throw new BadRequestError('Error when creating influencer service')
    }
  }

  async findAll() {
    return await this.client.manager.find(InfluencerEntity)
  }

  async deleteAll() {
    return this.client.manager.delete(InfluencerEntity, {})
  }
}