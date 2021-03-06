import { Request, Response } from 'express';
import { HTTPHelper } from '../../services/http.helper';
import { Logger } from '../../services/logger.service';
import { Item, ItemModel } from './item.model';

export class ItemController {

  static getList (req: Request, res: Response) {
    ItemModel
      .find({owner: req.user._id})
      .then(items => {
        res.json(items);
      })
      .catch((error: Error) => {
        const errorTitle = 'ItemController::getList() - find failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

  static create (req: Request, res: Response) {
    const newItem: Item = {
      url: req.body.url,
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      priority: req.body.priority,
      tags: req.body.tags,
      owner: req.user._id,
      createdAt: new Date()
    };
    if (req.body._id) {
      newItem._id = req.body._id;
    }
    new ItemModel(newItem)
      .save()
      .then(savedItem => {
        res.status(201).json(savedItem);
      })
      .catch((error: Error) => {
        const errorTitle = 'ItemController::create() - save failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

  static update (req: Request, res: Response) {
    ItemModel
      .findOne({
        _id: req.params.id,
        owner: req.user._id
      })
      .then(item => {
        if (!item) {
          return HTTPHelper.handle404(req, res, `No item ${req.params.id}`);
        }

        const allowedToEditFields = {
          url: req.body.url,
          title: req.body.title,
          imageUrl: req.body.imageUrl,
          description: req.body.description,
          priority: req.body.priority,
          tags: req.body.tags,
          viewedAt: req.body.viewedAt
        };

        Object.assign(item, allowedToEditFields);

        item
          .save()
          .then(savedItem => {
            res.json(savedItem);
          })
          .catch((error: Error) => {
            const errorTitle = 'ItemController.update() - ' +
              'Save item to DB failed';
            HTTPHelper.handleError(error, errorTitle, req, res);
          });
      })
      .catch((error: Error) => {
        const errorTitle = 'ItemController.update() - findOne failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

  static remove (req: Request, res: Response) {
    ItemModel
      .findOne({
        _id: req.params.id,
        owner: req.user._id
      })
      .remove()
      .then((removeResult: any) => {
        if (removeResult.result.ok && removeResult.result.n > 0) {
          return res.sendStatus(204);
        }
        if (!removeResult.result.ok) {
          Logger.error(
            'ItemController.remove() - removeResult is wrong',
            {removeResult}, req);
          return res.sendStatus(500);
        }
        if (!removeResult.result.n) {
          return res.sendStatus(404);
        }
      })
      .catch((error: Error) => {
        const errorTitle = 'ItemController.remove() - remove failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

}
