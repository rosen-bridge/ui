import { NextRequest } from 'next/server';

import Joi from 'joi';

interface GETEventParams {
  id: string;
}

const getEventSchema = Joi.object<GETEventParams>({
  id: Joi.string().required(),
});

export const validateGetEvent = async (
  _req: NextRequest,
  context?: { params?: GETEventParams },
) => {
  const result = getEventSchema.validate(context?.params);
  return result;
};
