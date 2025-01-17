/*
GDevelop - Anchor Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  export class AnchorRuntimeBehavior extends gdjs.RuntimeBehavior {
    _relativeToOriginalWindowSize: any;
    _leftEdgeAnchor: any;
    _rightEdgeAnchor: any;
    _topEdgeAnchor: any;
    _bottomEdgeAnchor: any;
    _invalidDistances: boolean = true;
    _leftEdgeDistance: number = 0;
    _rightEdgeDistance: number = 0;
    _topEdgeDistance: number = 0;
    _bottomEdgeDistance: number = 0;
    _useLegacyBottomAndRightAnchors: boolean = false;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
      this._relativeToOriginalWindowSize = !!behaviorData.relativeToOriginalWindowSize;
      this._leftEdgeAnchor = behaviorData.leftEdgeAnchor;
      this._rightEdgeAnchor = behaviorData.rightEdgeAnchor;
      this._topEdgeAnchor = behaviorData.topEdgeAnchor;
      this._bottomEdgeAnchor = behaviorData.bottomEdgeAnchor;
      this._useLegacyBottomAndRightAnchors =
        behaviorData.useLegacyBottomAndRightAnchors === undefined
          ? true
          : behaviorData.useLegacyBottomAndRightAnchors;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.leftEdgeAnchor !== newBehaviorData.leftEdgeAnchor) {
        this._leftEdgeAnchor = newBehaviorData.leftEdgeAnchor;
      }
      if (oldBehaviorData.rightEdgeAnchor !== newBehaviorData.rightEdgeAnchor) {
        this._rightEdgeAnchor = newBehaviorData.rightEdgeAnchor;
      }
      if (oldBehaviorData.topEdgeAnchor !== newBehaviorData.topEdgeAnchor) {
        this._topEdgeAnchor = newBehaviorData.topEdgeAnchor;
      }
      if (
        oldBehaviorData.bottomEdgeAnchor !== newBehaviorData.bottomEdgeAnchor
      ) {
        this._bottomEdgeAnchor = newBehaviorData.bottomEdgeAnchor;
      }
      if (
        oldBehaviorData.useLegacyTrajectory !==
        newBehaviorData.useLegacyTrajectory
      ) {
        this._useLegacyBottomAndRightAnchors =
          newBehaviorData.useLegacyBottomAndRightAnchors;
      }
      if (
        oldBehaviorData.relativeToOriginalWindowSize !==
        newBehaviorData.relativeToOriginalWindowSize
      ) {
        return false;
      }
      return true;
    }

    onActivate() {
      this._invalidDistances = true;
    }

    doStepPreEvents(runtimeScene) {
      const game = runtimeScene.getGame();
      let rendererWidth = game.getGameResolutionWidth();
      let rendererHeight = game.getGameResolutionHeight();
      const layer = runtimeScene.getLayer(this.owner.getLayer());
      if (this._invalidDistances) {
        if (this._relativeToOriginalWindowSize) {
          rendererWidth = game.getOriginalWidth();
          rendererHeight = game.getOriginalHeight();
        }

        //Calculate the distances from the window's bounds.
        const topLeftPixel = layer.convertCoords(
          this.owner.getDrawableX(),
          this.owner.getDrawableY()
        );

        //Left edge
        if (
          this._leftEdgeAnchor ===
          AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT
        ) {
          this._leftEdgeDistance = topLeftPixel[0];
        } else {
          if (
            this._leftEdgeAnchor ===
            AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT
          ) {
            this._leftEdgeDistance = rendererWidth - topLeftPixel[0];
          } else {
            if (
              this._leftEdgeAnchor ===
              AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL
            ) {
              this._leftEdgeDistance = topLeftPixel[0] / rendererWidth;
            }
          }
        }

        //Top edge
        if (
          this._topEdgeAnchor ===
          AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP
        ) {
          this._topEdgeDistance = topLeftPixel[1];
        } else {
          if (
            this._topEdgeAnchor ===
            AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM
          ) {
            this._topEdgeDistance = rendererHeight - topLeftPixel[1];
          } else {
            if (
              this._topEdgeAnchor ===
              AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL
            ) {
              this._topEdgeDistance = topLeftPixel[1] / rendererHeight;
            }
          }
        }
        const bottomRightPixel = layer.convertCoords(
          this.owner.getDrawableX() + this.owner.getWidth(),
          this.owner.getDrawableY() + this.owner.getHeight()
        );

        //Right edge
        if (
          this._rightEdgeAnchor ===
          AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT
        ) {
          this._rightEdgeDistance = bottomRightPixel[0];
        } else {
          if (
            this._rightEdgeAnchor ===
            AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT
          ) {
            this._rightEdgeDistance = rendererWidth - bottomRightPixel[0];
          } else {
            if (
              this._rightEdgeAnchor ===
              AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL
            ) {
              this._rightEdgeDistance = bottomRightPixel[0] / rendererWidth;
            }
          }
        }

        //Bottom edge
        if (
          this._bottomEdgeAnchor ===
          AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP
        ) {
          this._bottomEdgeDistance = bottomRightPixel[1];
        } else {
          if (
            this._bottomEdgeAnchor ===
            AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM
          ) {
            this._bottomEdgeDistance = rendererHeight - bottomRightPixel[1];
          } else {
            if (
              this._bottomEdgeAnchor ===
              AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL
            ) {
              this._bottomEdgeDistance = bottomRightPixel[1] / rendererHeight;
            }
          }
        }
        this._invalidDistances = false;
      } else {
        //Move and resize the object if needed
        let leftPixel = 0;
        let topPixel = 0;
        let rightPixel = 0;
        let bottomPixel = 0;

        //Left edge
        if (
          this._leftEdgeAnchor ===
          AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT
        ) {
          leftPixel = this._leftEdgeDistance;
        } else {
          if (
            this._leftEdgeAnchor ===
            AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT
          ) {
            leftPixel = rendererWidth - this._leftEdgeDistance;
          } else {
            if (
              this._leftEdgeAnchor ===
              AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL
            ) {
              leftPixel = this._leftEdgeDistance * rendererWidth;
            }
          }
        }

        //Top edge
        if (
          this._topEdgeAnchor ===
          AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP
        ) {
          topPixel = this._topEdgeDistance;
        } else {
          if (
            this._topEdgeAnchor ===
            AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM
          ) {
            topPixel = rendererHeight - this._topEdgeDistance;
          } else {
            if (
              this._topEdgeAnchor ===
              AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL
            ) {
              topPixel = this._topEdgeDistance * rendererHeight;
            }
          }
        }

        //Right edge
        if (
          this._rightEdgeAnchor ===
          AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_LEFT
        ) {
          rightPixel = this._rightEdgeDistance;
        } else {
          if (
            this._rightEdgeAnchor ===
            AnchorRuntimeBehavior.HorizontalAnchor.WINDOW_RIGHT
          ) {
            rightPixel = rendererWidth - this._rightEdgeDistance;
          } else {
            if (
              this._rightEdgeAnchor ===
              AnchorRuntimeBehavior.HorizontalAnchor.PROPORTIONAL
            ) {
              rightPixel = this._rightEdgeDistance * rendererWidth;
            }
          }
        }

        //Bottom edge
        if (
          this._bottomEdgeAnchor ===
          AnchorRuntimeBehavior.VerticalAnchor.WINDOW_TOP
        ) {
          bottomPixel = this._bottomEdgeDistance;
        } else {
          if (
            this._bottomEdgeAnchor ===
            AnchorRuntimeBehavior.VerticalAnchor.WINDOW_BOTTOM
          ) {
            bottomPixel = rendererHeight - this._bottomEdgeDistance;
          } else {
            if (
              this._bottomEdgeAnchor ===
              AnchorRuntimeBehavior.VerticalAnchor.PROPORTIONAL
            ) {
              bottomPixel = this._bottomEdgeDistance * rendererHeight;
            }
          }
        }
        const topLeftCoord = layer.convertInverseCoords(leftPixel, topPixel);
        const bottomRightCoord = layer.convertInverseCoords(
          rightPixel,
          bottomPixel
        );

        // Compatibility with GD <= 5.0.133
        if (this._useLegacyBottomAndRightAnchors) {
          //Move and resize the object according to the anchors
          if (
            this._rightEdgeAnchor !==
            AnchorRuntimeBehavior.HorizontalAnchor.NONE
          ) {
            this.owner.setWidth(bottomRightCoord[0] - topLeftCoord[0]);
          }
          if (
            this._bottomEdgeAnchor !== AnchorRuntimeBehavior.VerticalAnchor.NONE
          ) {
            this.owner.setHeight(bottomRightCoord[1] - topLeftCoord[1]);
          }
          if (
            this._leftEdgeAnchor !== AnchorRuntimeBehavior.HorizontalAnchor.NONE
          ) {
            this.owner.setX(
              topLeftCoord[0] + this.owner.getX() - this.owner.getDrawableX()
            );
          }
          if (
            this._topEdgeAnchor !== AnchorRuntimeBehavior.VerticalAnchor.NONE
          ) {
            this.owner.setY(
              topLeftCoord[1] + this.owner.getY() - this.owner.getDrawableY()
            );
          }
        }
        // End of compatibility code
        else {
          // Resize if right and left anchors are set
          if (
            this._rightEdgeAnchor !==
              AnchorRuntimeBehavior.HorizontalAnchor.NONE &&
            this._leftEdgeAnchor !== AnchorRuntimeBehavior.HorizontalAnchor.NONE
          ) {
            this.owner.setWidth(bottomRightCoord[0] - topLeftCoord[0]);
            this.owner.setX(topLeftCoord[0]);
          } else {
            if (
              this._leftEdgeAnchor !==
              AnchorRuntimeBehavior.HorizontalAnchor.NONE
            ) {
              this.owner.setX(
                topLeftCoord[0] + this.owner.getX() - this.owner.getDrawableX()
              );
            }
            if (
              this._rightEdgeAnchor !==
              AnchorRuntimeBehavior.HorizontalAnchor.NONE
            ) {
              this.owner.setX(
                bottomRightCoord[0] +
                  this.owner.getX() -
                  this.owner.getDrawableX() -
                  this.owner.getWidth()
              );
            }
          }
          // Resize if top and bottom anchors are set
          if (
            this._bottomEdgeAnchor !==
              AnchorRuntimeBehavior.VerticalAnchor.NONE &&
            this._topEdgeAnchor !== AnchorRuntimeBehavior.VerticalAnchor.NONE
          ) {
            this.owner.setHeight(bottomRightCoord[1] - topLeftCoord[1]);
            this.owner.setY(topLeftCoord[1]);
          } else {
            if (
              this._topEdgeAnchor !== AnchorRuntimeBehavior.VerticalAnchor.NONE
            ) {
              this.owner.setY(
                topLeftCoord[1] + this.owner.getY() - this.owner.getDrawableY()
              );
            }
            if (
              this._bottomEdgeAnchor !==
              AnchorRuntimeBehavior.VerticalAnchor.NONE
            ) {
              this.owner.setY(
                bottomRightCoord[1] +
                  this.owner.getY() -
                  this.owner.getDrawableY() -
                  this.owner.getHeight()
              );
            }
          }
        }
      }
    }

    doStepPostEvents(runtimeScene) {}

    static HorizontalAnchor = {
      NONE: 0,
      WINDOW_LEFT: 1,
      WINDOW_RIGHT: 2,
      PROPORTIONAL: 3,
    };
    static VerticalAnchor = {
      NONE: 0,
      WINDOW_TOP: 1,
      WINDOW_BOTTOM: 2,
      PROPORTIONAL: 3,
    };
  }
  gdjs.registerBehavior(
    'AnchorBehavior::AnchorBehavior',
    gdjs.AnchorRuntimeBehavior
  );
}
