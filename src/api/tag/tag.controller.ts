import { Request, Response } from 'express';
import { HTTPHelper } from '../../services/http.helper';
import { Logger } from '../../services/logger.service';
import { ItemModel } from '../item/item.model';
import { Tag, TagDBO, TagModel } from './tag.model';

export class TagController {

  static getList (req: Request, res: Response) {
    TagModel
      .find({owner: req.user._id})
      .then((tags: TagDBO[]) => {
        res.json(tags);
      })
      .catch((error: Error) => {
        const errorTitle = 'TagController::getList() - find failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

  static create (req: Request, res: Response) {
    const newTag: Tag = {
      name: req.body.name,
      owner: req.user._id,
      createdAt: new Date()
    };
    new TagModel(newTag)
      .save()
      .then(savedTag => {
        res.status(201).json(savedTag);
      })
      .catch((error: Error) => {
        const errorTitle = 'TagController::create() - save failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

  static update (req: Request, res: Response) {
    TagModel
      .findOne({
        _id: req.params.id,
        owner: req.user._id
      })
      .then(tag => {
        if (!tag) {
          return HTTPHelper.handle404(req, res, `No tag ${req.params.id}`);
        }

        const allowedToEditFields = {
          name: req.body.name
        };

        Object.assign(tag, allowedToEditFields);

        tag
          .save()
          .then(savedTag => {
            res.json(savedTag);
          })
          .catch((error: Error) => {
            const errorTitle = 'TagController.update() - ' +
              'Save tag to DB failed';
            HTTPHelper.handleError(error, errorTitle, req, res);
          });
      })
      .catch((error: Error) => {
        const errorTitle = 'TagController.update() - findOne failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

  static remove (req: Request, res: Response) {
    TagModel
      .remove({
        _id: req.params.id,
        owner: req.user._id
      })
      .then((removeResult: any) => {
        if (removeResult.result.ok && removeResult.result.n > 0) {
          ItemModel
            .update(
              {'owner': req.user._id},
              {$pull: {tags: req.params.id}},
              {multi: true}
            )
            .then((updateResult: any) => {
              if (updateResult.ok) {
                return res.sendStatus(204);
              } else {
                Logger.error(
                  'TagController.remove() - updateResult is wrong',
                  {updateResult}, req);
                return res.sendStatus(500);
              }
            })
            .catch((error: Error) => {
              const errorTitle = 'TagController.remove() - remove failed';
              HTTPHelper.handleError(error, errorTitle, req, res);
            });
        }
        if (!removeResult.result.ok) {
          Logger.error(
            'TagController.remove() - removeResult is wrong',
            {removeResult}, req);
          return res.sendStatus(500);
        }
        if (!removeResult.result.n) {
          return res.sendStatus(404);
        }

      })
      .catch((error: Error) => {
        const errorTitle = 'TagController.remove() - remove failed';
        HTTPHelper.handleError(error, errorTitle, req, res);
      });
  }

}
