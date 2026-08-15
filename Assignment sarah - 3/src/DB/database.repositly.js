export const findOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  let doc = model.findOne(filter);

  if (select.length) doc = doc.select(select);
  if (options.populate) doc = doc.populate(options.populate);
  if (options.lean) doc = doc.lean();

  return await doc.exec();
};


export const create = async ({
  model,
  data,
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};
export const createOne = async ({
  model,
  data = {},
} = {}) => {
  return await model.create(data);
};
export const insertMany = async ({
  model,
  data = [],
  options = {},
} = {}) => {
  return await model.insertMany(data, options);
};
export const findById = async ({
  model,
  id = "",
  select = "",
  options = {},
} = {}) => {
  let doc = model.findById(id);

  if (select.length) doc = doc.select(select);
  if (options.populate) doc = doc.populate(options.populate);
  if (options.lean) doc = doc.lean();

  return await doc.exec();
};

export const find = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  let doc = model.find(filter);

  if (select.length) doc = doc.select(select);
  if (options.populate) doc = doc.populate(options.populate);
  if (options.lean) doc = doc.lean();
  if (options?.limit) doc = doc.limit(options.limit);
  if (options?.skip !== undefined) doc = doc.skip(options.skip);

  return await doc.exec();
};

export const updateOne = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  return await model.updateOne(
    filter,
    { ...update, $inc: { __v: 1 } },
    options
  );
};
export const findByIdAndUpdate = async ({
  model,
  id = "",
  update = {},
  options = {},
} = {}) => {
  return await model.findByIdAndUpdate(
    id,
    { ...update, $inc: { __v: 1 } },
    { ...options, new: true, runValidators: true }
  );
};

export const deleteOne = async ({
  model,
  filter = {},
} = {}) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async ({
  model,
  filter = {},
} = {}) => {
  return await model.deleteMany(filter);
};

export const findOneAndDelete = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  let doc = model.findOneAndDelete(filter, options);

  if (select.length) doc = doc.select(select);

  return await doc.exec();
};