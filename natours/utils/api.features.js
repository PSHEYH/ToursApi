const Tour = require('../models/tour');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    ////Gte gt lte lt
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = Tour.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select(' -__v');
    }
    return this;
  }

  paginate() {
    const limit = this.queryString.limit * 1 || 10;
    const page = this.queryString.page * 1;

    this.query = this.query.skip((page - 1) * 10).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
