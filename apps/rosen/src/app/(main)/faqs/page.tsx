'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Chip,
  Container,
  EmptyState,
  Icon,
  InputAdornment,
  Stack,
  Text,
  TextField,
} from '@rosen-bridge/ui-kit';

import { faqs } from './config';

const ALL = 'All';

const categories = [ALL, ...faqs.map(({ title }) => title)];

const getText = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) => {
      if (isValidElement<PropsWithChildren>(child)) return getText(child.props.children);
      return String(child);
    })
    .join('');

const highlight = (node: ReactNode, query: string): ReactNode => {
  if (!query) return node;

  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  return Children.map(node, (child) => {
    if (isValidElement<PropsWithChildren>(child)) {
      return cloneElement(child, undefined, highlight(child.props.children, query));
    }

    if (typeof child !== 'string') return child;

    return child.split(pattern).map((part, index) =>
      // biome-ignore lint/suspicious/noArrayIndexKey: Parts have no identity of their own
      index % 2 ? <mark key={index}>{part}</mark> : part,
    );
  });
};

const FAQs = () => {
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(ALL);

  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    void searchParams;

    setSearch(new URLSearchParams(window.location.search).get('q') ?? '');
  }, [searchParams]);

  const query = search.trim();

  const items = useMemo(() => {
    const value = query.toLowerCase();

    return faqs
      .filter(({ title }) => category === ALL || title === category)
      .flatMap((group) => group.items)
      .filter(
        ({ answer, question }) =>
          question.toLowerCase().includes(value) || getText(answer).toLowerCase().includes(value),
      );
  }, [category, query]);

  return (
    <Container maxWidth="900px">
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Text as="h2" align="center" color="primary-dark" variant="display1" weight="bold">
            Everything You Need To Know
          </Text>
          <Text align="center" color="text-secondary" variant="body1">
            Quick answers about bridging your assets with Rosen, from fees and wallets to tracking
            your transfers.
          </Text>
        </Stack>
        <Stack
          aria-label="Categories"
          direction="row"
          justify="center"
          role="group"
          spacing={1}
          wrap
        >
          {categories.map((title) => (
            <Chip
              key={title}
              color={category === title ? 'primary' : 'neutral'}
              label={title}
              onClick={() => setCategory(title)}
            />
          ))}
        </Stack>
        <TextField
          hiddenLabel
          placeholder="Search your question..."
          variant="filled"
          value={search}
          inputProps={{ 'aria-label': 'Search your question' }}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <Icon color="text-secondary" name="Search" />
              </InputAdornment>
            ),
          }}
          style={{
            alignSelf: 'center',
            maxWidth: '450px',
          }}
          onChange={(event) => {
            setSearch(event.target.value);

            const q = event.target.value;

            const query = q ? `?${new URLSearchParams({ q })}` : '';

            window.history.replaceState(null, '', `${window.location.pathname}${query}`);
          }}
        />
        {items.length ? (
          <Accordion defaultValue={[faqs[0].items[0].question]}>
            {items.map(({ answer, question }) => (
              <AccordionItem key={question} value={question}>
                <AccordionHeader>{highlight(question, query)}</AccordionHeader>
                <AccordionPanel>{highlight(answer, query)}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <EmptyState subtitle />
        )}
      </Stack>
    </Container>
  );
};

export default FAQs;
