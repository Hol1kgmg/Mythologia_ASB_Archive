import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { forwardRef } from 'react';
import { Box } from './Box';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
      auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
      autoSm: 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
      autoLg: 'grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    },
    responsive: {
      true: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      false: '',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    },
  },
  defaultVariants: {
    cols: 'auto',
    gap: 'md',
    responsive: false,
    align: 'stretch',
    justify: 'stretch',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  children?: React.ReactNode;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, responsive, align, justify, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={gridVariants({
          cols: responsive ? undefined : cols,
          gap,
          responsive,
          align,
          justify,
          className,
        })}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item component for advanced layouts
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto';
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full' | 'auto';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
  children?: React.ReactNode;
}

const gridItemVariants = cva('', {
  variants: {
    colSpan: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
      full: 'col-span-full',
      auto: 'col-auto',
    },
    rowSpan: {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
      5: 'row-span-5',
      6: 'row-span-6',
      full: 'row-span-full',
      auto: 'row-auto',
    },
    colStart: {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      7: 'col-start-7',
      8: 'col-start-8',
      9: 'col-start-9',
      10: 'col-start-10',
      11: 'col-start-11',
      12: 'col-start-12',
      13: 'col-start-13',
      auto: 'col-start-auto',
    },
    rowStart: {
      1: 'row-start-1',
      2: 'row-start-2',
      3: 'row-start-3',
      4: 'row-start-4',
      5: 'row-start-5',
      6: 'row-start-6',
      7: 'row-start-7',
      auto: 'row-start-auto',
    },
  },
});

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, colStart, rowStart, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={gridItemVariants({ colSpan, rowSpan, colStart, rowStart, className })}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

GridItem.displayName = 'GridItem';

export { Grid, GridItem, gridVariants };
