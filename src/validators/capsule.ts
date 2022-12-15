import Joi from 'joi';

const capsuleValidationSchemas = {
  capsuleCreation: Joi.object({
    serial: Joi.string().required(),
    type: Joi.string(),
    status: Joi.string(),
    reuse_count: Joi.number().positive(),
    water_landings: Joi.number().positive(),
    land_landings: Joi.number().positive(),
    last_update: Joi.string()
  })
};

export default capsuleValidationSchemas;
