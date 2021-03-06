const { checkSchema } = require("express-validator");
const ValidationHelper = require("../helpers/validation");
const multer = require("multer");

class CashFlowController {
  constructor({ cashFlowService }) {
    this.cashFlowService = cashFlowService;
    this.upload = multer({ storage: multer.memoryStorage() });
  }

  getSummary() {
    return [this.getSummaryValidator(), this.getSummaryHandler()];
  }

  getSummaryValidator() {
    return ValidationHelper.validate(
      checkSchema({
        start_date: { optional: { options: { nullable: true } } },
        end_date: { optional: { options: { nullable: true } } },
      })
    );
  }

  getSummaryHandler() {
    return async (req, res, next) => {
      const { start_date, end_date } = req.query;
      const data = await this.cashFlowService.getSummary({
        user_id: req?.user?._id,
        start_date,
        end_date,
      });
      return res.json({ data });
    };
  }

  getByUser() {
    return [this.getByUserHandler()];
  }

  getByUserHandler() {
    return async (req, res, next) => {
      const { start_date, end_date, category_id } = req.query;
      const data = await this.cashFlowService.getByUser({
        user_id: req?.user?._id,
        start_date,
        end_date,
        category_id,
      });
      return res.json({ data });
    };
  }

  getById() {
    return [this.getByIdValidator(), this.getByIdHandler()];
  }

  getByIdValidator() {
    return ValidationHelper.validate(
      checkSchema({ id: { notEmpty: { errorMessage: "id required" } } })
    );
  }

  getByIdHandler() {
    return async (req, res, next) => {
      const { id } = req.params;
      const data = await this.cashFlowService.getById({
        user_id: req?.user?._id,
        id,
      });
      return res.status(data ? 200 : 404).json({ data });
    };
  }

  create() {
    return [
      this.upload.single("receipt"),
      this.createValidator(),
      this.createHandler(),
    ];
  }

  createValidator() {
    return ValidationHelper.validate(
      checkSchema({
        name: { notEmpty: { errorMessage: "name required" } },
        category_id: { notEmpty: { errorMessage: "category required" } },
        amount: { notEmpty: { errorMessage: "amount required" } },
        date: { notEmpty: { errorMessage: "date required" } },
      })
    );
  }

  createHandler() {
    return async (req, res, next) => {
      try {
        const { name, category_id, amount, note, date } = req.body;
        const data = await this.cashFlowService.create({
          user_id: req?.user?._id,
          name,
          category_id,
          amount,
          note,
          date,
          receipt: req?.file,
        });
        return res.status(201).json({ data, message: "Cash Flow created" });
      } catch (error) {
        next(error);
      }
    };
  }

  update() {
    return [
      this.upload.single("receipt"),
      this.updateValidator(),
      this.updateHandler(),
    ];
  }

  updateValidator() {
    return ValidationHelper.validate(
      checkSchema({
        name: { optional: { options: { nullable: true } } },
        category_id: { optional: { options: { nullable: true } } },
        amount: { optional: { options: { nullable: true } } },
        date: { optional: { options: { nullable: true } } },
      })
    );
  }

  updateHandler() {
    return async (req, res, next) => {
      try {
        const { id } = req.params;
        const { name, category_id, amount, note, date } = req.body;
        const data = await this.cashFlowService.update({
          id,
          user_id: req?.user?._id,
          category_id,
          name,
          amount,
          note,
          date,
          receipt: req?.file,
        });
        return res.status(200).json({ data, message: "Cash Flow updated" });
      } catch (error) {
        next(error);
      }
    };
  }

  delete() {
    return [this.deleteValidator(), this.deleteHandler()];
  }

  deleteValidator() {
    return ValidationHelper.validate(
      checkSchema({ id: { notEmpty: { errorMessage: "id required" } } })
    );
  }

  deleteHandler() {
    return async (req, res, next) => {
      try {
        const { id } = req.params;
        const data = await this.cashFlowService.delete({
          user_id: req?.user?._id,
          id,
        });
        return res.status(data ? 200 : 404).json({
          data,
          message: data ? "Cash Flow deleted" : "Cash Flow not found",
        });
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = CashFlowController;
