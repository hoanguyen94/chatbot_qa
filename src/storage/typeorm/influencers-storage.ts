import { DataSource } from "typeorm";
import BadRequestError from "../../error/bad-request-error.js";
import { InfluencerEntity } from "./entity/influencers.entity.js";

export class InfluencerStorateService {
  constructor(private readonly log: any, private readonly client: DataSource) { }
  async createMany(data: InfluencerEntity[]) {
    try {
      this.log.info(`create influencers with ${JSON.stringify(data)}`)
      return await this.client.transaction(async manager => {
        const trans = data.map(async entity => {
          const influencer = new InfluencerEntity()
          await manager.save(Object.assign(influencer, entity))
        })
        const result = Promise.all(trans)
        this.log.info('Creating all influencers successfully')
        return result
      })

    } catch (error) {
      this.log.error(
        "Error when saving influencers %s",
        (error as Error).message
      );
      throw new BadRequestError(`Error when creating influencer service: ${error}`)
    }
  }

  async findAll() {
    try {
      const result = await this.client.manager.find(InfluencerEntity)
      this.log.info('Finding all influencers successfully')
      return result
    } catch (error) {
      this.log.error(
        "Error when finding influencers %s",
        (error as Error).message
      );
      throw new BadRequestError(`Error when finding influencer service: ${error}`)
    }
  }

  async deleteAll() {
    try {
      const result = this.client.manager.delete(InfluencerEntity, {})
      this.log.info('Deleting all influencers successfully')
      return result
    } catch (error) {
      this.log.error(
        "Error when finding influencers %s",
        (error as Error).message
      );
      throw new BadRequestError(`Error when deleting influencer service: ${error}`)
    }
  }
}