import { Controller, HttpServer } from "../index";
import { RequestHandler } from "express";
import itemService from "../../../core/services/item-service";
import { HttpResponseError } from "../../../core/utils/http-response-error";

export class ItemController implements Controller {
  initialize(httpServer: HttpServer): void {
    const apiPath = "/item";

    // Create a new item
    httpServer.post(apiPath, this.createItem.bind(this), ["authenticated"]);

    // Update an existing item
    httpServer.put(`${apiPath}/:id`, this.updateItem.bind(this), [
      "authenticated",
    ]);

    // Get an item by ID
    httpServer.get(`${apiPath}/:id`, this.getItem.bind(this), [
      "authenticated",
    ]);

    // Delete an item by ID
    httpServer.delete(`${apiPath}/:id`, this.deleteItem.bind(this), [
      "authenticated",
    ]);

    // Get all items (optional)
    httpServer.get(apiPath, this.getAllItems.bind(this), ["authenticated"]);
  }

  // Create a new item
  private readonly createItem: RequestHandler = async (req, res, next) => {
    try {
      const item = await itemService.createItem(req.body, req.auth.uid);
      if (item) {
        res.status(201).send(item);
      } else {
        throw new HttpResponseError(400, "Item creation failed");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Update an existing item
  private readonly updateItem: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const success = await itemService.updateItem(id, updateData);
      if (success) {
        res.status(200).send({ message: "Item updated successfully" });
      } else {
        throw new HttpResponseError(404, "Item not found or update failed");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Get an item by ID
  private readonly getItem: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await itemService.getItem(id);

      if (item) {
        res.status(200).send(item);
      } else {
        throw new HttpResponseError(404, "Item not found");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Delete an item by ID
  private readonly deleteItem: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const success = await itemService.deleteItem(id);

      if (success) {
        res.status(200).send({ message: "Item deleted successfully" });
      } else {
        throw new HttpResponseError(404, "Item not found or deletion failed");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Get all items with optional filters and pagination
  private readonly getAllItems: RequestHandler = async (req, res, next) => {
    try {
      const filters = {
        author: req.query.author as string,
        type: req.query.type as string,
        status: req.query.status as string,
      };

      const pageSize = parseInt(req.query.pageSize as string) || 50; // Default to 50
      const startAfterId = req.query.startAfterId as string; // ID to start after

      const items = await itemService.getAllItems(filters, pageSize, startAfterId);

      // Return the items with 200 status, even if the result is empty
      res.status(200).send(items || []);
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };
}