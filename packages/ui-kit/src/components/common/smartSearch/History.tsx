import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ClickAwayListener } from '@mui/material';
import { Favorite, History as HistoryIcon, Times } from '@rosen-bridge/icons';

import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '../../base';
import { IconButton, SvgIcon } from '../../base';
import { Popup } from './Popup';
import { Filter, Selected } from './types';
import { parseFilter } from './utils';

type Item = {
  bookmark: boolean;
  selected: Selected[];
};

export type HistoryRef = {
  add: (selected: Selected[]) => void;
};

export type HistoryProps = {
  disabled?: boolean;
  filter: Filter[];
  namespace: string;
  onSelect: (selected: Selected[]) => void;
};

export const History = forwardRef<HistoryRef, HistoryProps>(
  ({ disabled, filter, namespace, onSelect }, ref) => {
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

    const getKey = useCallback((selected: Selected[]) => {
      return JSON.stringify(selected);
    }, []);

    const load = useCallback(() => {
      const raw = window.localStorage.getItem(
        `rosen:searchable-filter:${namespace}`,
      );

      const json = trim(JSON.parse(raw || '[]'));

      setItems(json);
    }, [namespace]);

    const save = useCallback(
      (items: Item[]) => {
        const raw = JSON.stringify(items);
        window.localStorage.setItem(
          `rosen:searchable-filter:${namespace}`,
          raw,
        );
      },
      [namespace],
    );

    const trim = (items: Item[]) => {
      const booked = items.filter((item) => item.bookmark);

      const unbooked = items
        .filter((item) => !item.bookmark)
        .reverse()
        .slice(0, 10)
        .reverse();

      return [...booked, ...unbooked];
    };

    const add = useCallback(
      (selected: Selected[]) => {
        if (!selected.length) return;

        const key = getKey(selected);

        const has = items.some((item) => getKey(item.selected) == key);

        if (has) return;

        const next = trim([...items, { bookmark: false, selected }]);

        setItems(next);

        save(next);
      },
      [items, getKey, save],
    );

    const book = useCallback(
      (item: Item) => {
        const filtered = items.filter((current) => current != item);

        const next = trim([...filtered, { ...item, bookmark: true }]);

        setItems(next);

        save(next);
      },
      [items, save],
    );

    const remove = useCallback(
      (item: Item) => {
        const filtered = items.filter((current) => current != item);

        const next = trim([...filtered, { ...item, bookmark: false }]);

        setItems(next);

        save(next);
      },
      [items, save],
    );

    const getTitle = (item: Item) => {
      return item.selected
        .map((current) => {
          const parsed = parseFilter(filter, current);

          if (!parsed) return;

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

    const handleClick = (item: Item) => {
      onSelect(item.selected);
      setOpen(false);
    };

    useEffect(() => {
      open && load();
    }, [open, load]);

    useImperativeHandle(ref, () => {
      return { add };
    }, [add]);

    return (
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <IconButton
            disabled={disabled}
            ref={$anchor}
            onClick={() => setOpen(!open)}
          >
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
                      key={getKey(item.selected)}
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
                      onClick={() => handleClick(item)}
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
            <List
              style={{ maxWidth: '560px' }}
              subheader={<ListSubheader>Recent searches</ListSubheader>}
            >
              {!recent.length && (
                <ListItem>
                  <ListItemText primary="You don't have any recent searches" />
                </ListItem>
              )}
              {recent.map((item) => (
                <ListItem
                  disablePadding
                  key={getKey(item.selected)}
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
                  onClick={() => handleClick(item)}
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
