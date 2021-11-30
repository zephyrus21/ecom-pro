//* What this will do

//@ base - Product.find()
//@ base - Product.find(email: {"piyush@pandey.com"})

//@ bigQ - /search=coder&page=2&category=books&rating[gte]=4&price[lte]=500&price[gte]=200&limit=10

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchword });
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    let copyQString = JSON.stringify(copyQ);

    copyQString = copyQString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    const copyQJson = JSON.parse(copyQString);

    this.base = this.base.find(copyQJson);

    return this;
  }

  pager(resultPerPage) {
    let currentPage = this.bigQ.page || 1;

    const skipVal = (currentPage - 1) * resultPerPage;

    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;
