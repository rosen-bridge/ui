import { type CSSProperties, useState } from 'react';

import { Action, Popover, PopoverBody, PopoverTrigger, Skeleton, Text } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface RailOverrides {}

export type RailOwnProps = {
  stages: {
    label: string;
    steps: {
      label: string;
      tags: {
        label: string;
        color?: Color;
        onClick?: () => void;
      }[];
    }[];
  }[];
  loading?: boolean;
  tagVisibleLimit?: number;
};

export type RailBaseProps = ElementBaseProps<'div', RailOwnProps>;

export type RailProps = OverridableType<RailBaseProps, RailOverrides, never>;

export const Rail = (props: RailProps) => {
  const { stages, loading, style, tagVisibleLimit = 2, ...rest } = useConfig('Rail', props);

  const [openKey, setOpenKey] = useState<string>();

  const stepCount = stages.reduce((total, stage) => total + stage.steps.length, 0);

  const stageStepOffset = (stageIndex: number) => {
    return stages.slice(0, stageIndex).reduce((total, stage) => total + stage.steps.length, 0);
  };

  const styles = {
    '--RosenRail-step-count': stepCount,
    ...style,
  } as CSSProperties;

  return (
    <div style={styles} {...rest}>
      {stages.map((stage, stageIndex) => (
        <div
          key={stage.label}
          className="RosenRail-stage"
          style={
            {
              '--RosenRail-stage-start': stageStepOffset(stageIndex),
              '--RosenRail-stage-end': stageStepOffset(stageIndex) + stage.steps.length,
            } as CSSProperties
          }
        >
          <Text className="RosenRail-label" variant="body2" align="center" weight="bold" truncate>
            {stage.label}
          </Text>
          <div className="RosenRail-steps">
            {stage.steps.map((step) => (
              <Text key={step.label} className="RosenRail-step" variant="body3" truncate>
                {step.label}
              </Text>
            ))}
          </div>
          <div className="RosenRail-tag-columns">
            {stage.steps.map((step) => {
              const visibleTags = step.tags.slice(0, tagVisibleLimit);
              const hiddenCount = step.tags.length - visibleTags.length;
              const key = `${stage.label}-${step.label}`;
              return (
                <div key={step.label} className="RosenRail-tags">
                  {visibleTags.map((tag) => (
                    <Text
                      key={tag.label}
                      className="RosenRail-tag"
                      variant="body3"
                      color={tag.color ?? 'text-secondary'}
                      as={tag.onClick ? Action : 'span'}
                      onClick={tag.onClick}
                    >
                      {tag.label}
                    </Text>
                  ))}
                  {hiddenCount > 0 && (
                    <Popover
                      open={openKey === key}
                      onOpenChange={(open) => setOpenKey(open ? key : undefined)}
                    >
                      <PopoverTrigger as={Action} className="RosenRail-more">
                        +{hiddenCount} more
                      </PopoverTrigger>
                      <PopoverBody className="RosenRail-tooltip">
                        {step.tags.map((tag) => (
                          <Text
                            key={tag.label}
                            variant="body3"
                            color={tag.color ?? 'text-secondary'}
                            as={tag.onClick ? Action : 'span'}
                            onClick={
                              tag.onClick &&
                              (() => {
                                setOpenKey(undefined);
                                tag.onClick?.();
                              })
                            }
                          >
                            {tag.label}
                          </Text>
                        ))}
                      </PopoverBody>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {loading && <Skeleton attached variant="rounded" />}
    </div>
  );
};

Rail.displayName = 'Rail';
