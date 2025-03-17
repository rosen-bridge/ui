import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ClickAwayListener,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { Favorite, History as HistoryIcon, Times } from '@rosen-bridge/icons';

import { IconButton, SvgIcon } from '../../base';
import { Popup } from './Popup';
import { Flow, Selected } from './types';
import { aaaaa } from './utils';

type Item = {
  bookmark: boolean;
  selected: Selected[];
};

export type HistoryRef = {
  add: (selected: Selected[]) => void;
};

export type HistoryProps = {
  flows: Flow[];
  namespace: string;
  onSelect: (selected: Selected[]) => void;
};

export const History = forwardRef<HistoryRef, HistoryProps>(
  ({ flows, namespace, onSelect }, ref) => {
    const $anchor = useRef<HTMLButtonElement | null>(null);

    const [open, setOpen] = useState(false);

    const [items, setItems] = useState<Item[]>([]);

    const bookmarks = useMemo(
      () => items.filter((item) => item.bookmark == true),
      [items],
    );

    const recent = useMemo(
      () => items.filter((item) => item.bookmark != true),
      [items],
    );

    const load = useCallback(() => {
      const raw = window.localStorage.getItem(
        `rosen:searchable-filter:${namespace}`,
      );

      const json = JSON.parse(raw || '[]');

      setItems(json);
    }, [namespace]);

    const save = useCallback(() => {
      const raw = JSON.stringify(items);
      window.localStorage.setItem(`rosen:searchable-filter:${namespace}`, raw);
    }, [items, namespace]);

    const add = useCallback(
      (selected: Selected[]) => {
        setItems([...items, { bookmark: false, selected }]);
        save();
      },
      [items, save],
    );

    const book = useCallback(
      (item: Item) => {
        const index = items.findIndex((current) => current === item);

        items.splice(index, 1, { ...item, bookmark: true });

        setItems([...items]);

        save();
      },
      [items, save],
    );

    const remove = useCallback(
      (item: Item) => {
        const index = items.findIndex((current) => current === item);

        items.splice(index, 1, { ...item, bookmark: false });

        setItems([...items]);

        save();
      },
      [items, save],
    );

    const getKey = (item: Item) => {
      return JSON.stringify(item);
    };

    const getTitle = (item: Item) => {
      return item.selected
        .map((current) => {
          const parsed = aaaaa(flows, current)!;

          const sections = [parsed.flow.label, parsed.operator!.label];

          [parsed.value].flat().forEach((value) => {
            if (typeof value == 'object' && 'label' in value) {
              sections.push(value.label);
            } else {
              sections.push(`${value}`);
            }
          });

          return sections.join(' ');
        })
        .join(' ');
    };

    useEffect(() => load, [load]);

    useImperativeHandle(ref, () => {
      return {
        add,
      };
    }, [add]);

    return (
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <IconButton ref={$anchor} onClick={() => setOpen(!open)}>
            <SvgIcon>
              <HistoryIcon />
            </SvgIcon>
          </IconButton>
          <Popup anchorEl={$anchor.current} open={open}>
            {!!bookmarks.length && (
              <>
                <List subheader={<ListSubheader>Bookmark</ListSubheader>}>
                  {bookmarks.map((item) => (
                    <ListItem
                      disablePadding
                      key={getKey(item)}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={(event) => {
                            event.stopPropagation();
                            remove(item);
                          }}
                        >
                          <SvgIcon>
                            <Times />
                          </SvgIcon>
                        </IconButton>
                      }
                      onClick={() => {
                        onSelect(item.selected);
                        setOpen(false);
                      }}
                    >
                      <ListItemButton>
                        <ListItemText primary={getTitle(item)} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider />
              </>
            )}
            <List subheader={<ListSubheader>Recent searches</ListSubheader>}>
              {!recent.length && (
                <ListItem>
                  <ListItemText primary="You don't have any recent searches" />
                </ListItem>
              )}
              {recent.map((item) => (
                <ListItem
                  disablePadding
                  key={getKey(item)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(event) => {
                        event.stopPropagation();
                        book(item);
                      }}
                    >
                      <SvgIcon>
                        <Favorite />
                      </SvgIcon>
                    </IconButton>
                  }
                  onClick={() => {
                    onSelect(item.selected);
                    setOpen(false);
                  }}
                >
                  <ListItemButton>
                    <ListItemText primary={getTitle(item)} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Popup>
        </div>
      </ClickAwayListener>
    );
  },
);
