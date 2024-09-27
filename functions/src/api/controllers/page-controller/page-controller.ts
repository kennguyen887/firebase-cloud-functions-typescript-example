import { Controller, HttpServer } from "../index";
import { RequestHandler } from "express";
import pageService from "../../../core/services/page-service";
import { HttpResponseError } from "../../../core/utils/http-response-error";

export class PageController implements Controller {
  initialize(httpServer: HttpServer): void {
    const apiPath = "/page";

    // Create a new page
    httpServer.post(apiPath, this.createPage.bind(this), ["authenticated"]);

    // Update an existing page
    httpServer.put(`${apiPath}/:id`, this.updatePage.bind(this), [
      "authenticated",
    ]);

    // Get a page by ID
    httpServer.get(`${apiPath}/:id`, this.getPage.bind(this), [
      "authenticated",
    ]);

    // Delete a page by ID
    httpServer.delete(`${apiPath}/:id`, this.deletePage.bind(this), [
      "authenticated",
    ]);

    // Get all pages (optional)
    httpServer.get(apiPath, this.getAllPages.bind(this), ["authenticated"]);
  }

  // Create a new page
  private readonly createPage: RequestHandler = async (req, res, next) => {
    try {
      const page = await pageService.createPage(req.body, req.auth.uid);
      if (page) {
        res.status(201).send(page);
      } else {
        throw new HttpResponseError(400, "Page creation failed");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Update an existing page
  private readonly updatePage: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const success = await pageService.updatePage(id, updateData);
      if (success) {
        res.status(200).send({ message: "Page updated successfully" });
      } else {
        throw new HttpResponseError(404, "Page not found or update failed");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Get a page by ID
  private readonly getPage: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const page = await pageService.getPage(id);

      if (page) {
        res.status(200).send(page);
      } else {
        throw new HttpResponseError(404, "Page not found");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  // Delete a page by ID
  private readonly deletePage: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const success = await pageService.deletePage(id);

      if (success) {
        res.status(200).send({ message: "Page deleted successfully" });
      } else {
        throw new HttpResponseError(404, "Page not found or deletion failed");
      }
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };

  private readonly getAllPages: RequestHandler = async (req, res, next) => {
    try {
      // Extract filters and pagination parameters from query
      const filters = {
        author: req.query.author as string,
        type: req.query.type as string,
        status: req.query.status as string,
      };

      const pageSize = parseInt(req.query.pageSize as string) || 50; // Default to 50
      const startAfterId = req.query.startAfterId as string; // ID to start after

      const pages = await pageService.getAllPages(
        filters,
        pageSize,
        startAfterId
      );

      // Return the pages with 200 status, even if the result is empty
      res.status(200).send(pages || []);
    } catch (error) {
      next(
        new HttpResponseError(500, error.message || "Internal Server Error")
      );
    }
  };
}
