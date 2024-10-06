import { SxProps, Theme } from '@mui/system';
import { CSSProperties } from 'react';
import { ViewProps } from './types';

export function handleProps(props: ViewProps): Omit<ViewProps, 'sx'> & { sx: SxProps<Theme> } {
    let {
        m,
        p,
        sx,
        bgColor,
        red,
        blue,
        row,
        column,
        jCenter,
        displayNone,
        jStart,
        jEnd,
        jSpaceAround,
        jSpaceBetween,
        aStart, aEnd,
        aCenter,
        m12,
        ml12,
        mt12,
        mr12,
        mb12,
        p12,
        pl12,
        pt12,
        pr12,
        pb12,
        ph8,
        bottom, right,left,top,
        pv8,
        w,
        h,
        wh,
        x,
        y,
        mx,
        px,
        my,
        py,
        mr,
        pr,
        ml,
        pl,
        mt,
        pt,
        mb,
        pb,
        fWrap,
        absolute,
        abs,
        rel,
        relative,
        absFull,
        center,
        h100p,
        h100vh,
        w100p,
        wh100p,
        w100vw,
        overflowHidden,
        overflowYAuto,
        zIdx,
        opacity,
        ...props_
    } = props;

    const sx_: CSSProperties  = {};

    if (absolute || abs) {
        sx_.position = 'absolute';
    }
    if(relative){
        sx_.position = 'relative';
    }
    if (rel) {
        sx_.position = 'relative';
    }
    if (absFull) {
        sx_.position = 'absolute';
        sx_.left = 0;
        sx_.top = 0;
        sx_.right = 0;
        sx_.bottom = 0;
    }
    if (x !== undefined) {
        sx_.left = `${x}px`;
    }

    if (y !== undefined) {
        sx_.top = `${y}px`;
    }

    if (bottom !== undefined) {
        sx_.bottom = `${bottom}px`;
    }

    if (top !== undefined) {
        sx_.top = `${top}px`;
    }

    if (left !== undefined) {
        sx_.left = `${left}px`;
    }

    if (right !== undefined) {
        sx_.right = `${right}px`;
    }

    if (w !== undefined) {
        if (typeof w === 'string') {
            sx_.width = w;
        } else {
            sx_.width = `${w}px`;
        }

    }

    if (wh !== undefined) {
        if (typeof wh === 'string') {
            sx_.height = wh;
            sx_.width = wh;
        } else {
            sx_.height = `${wh}px`;
            sx_.width = `${wh}px`;
        }
    }

    if (h !== undefined) {
        if (typeof h === 'string') {
            sx_.height = h;
        } else {
            sx_.height = `${h}px`;
        }
    }
    if (w100p) {
        sx_.width = '100%';
    }


    if (w100vw) {
        sx_.width = '100vw';
    }
    if (h100p) {
        sx_.height = '100%';
    }
    if (h100vh) {
        sx_.height = '100vh';
    }

    if (wh100p) {
        sx_.width = sx_.height = '100%';
    }
    if (m !== undefined) {
        let margin = '';
        if (0 === String(m).indexOf('px')) {
            margin = `${m}px`;
        } else {
            margin = String(m);
        }
        sx_.margin = margin;
    }

    if (p !== undefined) {
        let padding = '';
        if (0 === String(p).indexOf('px')) {
            padding = `${p}px`;
        } else {
            padding = String(p);
        }
        sx_.padding = padding;
    }
    if (mx !== undefined) {
        sx_.marginLeft = `${mx}px`;
        sx_.marginRight = `${mx}px`;
    }

    if (px !== undefined) {
        sx_.paddingLeft = `${px}px`;
        sx_.paddingRight = `${px}px`;
    }


    if (my !== undefined) {
        sx_.marginTop = `${my}px`;
        sx_.marginBottom = `${my}px`;
    }

    if (py !== undefined) {
        sx_.paddingTop = `${py}px`;
        sx_.paddingBottom = `${py}px`;
    }

    if (mr !== undefined) {
        sx_.marginRight = `${mr}px`;
    }


    if (pr !== undefined) {
        sx_.paddingRight = `${pr}px`;
    }

    if (ml !== undefined) {
        sx_.marginLeft = `${ml}px`;
    }

    if (pl !== undefined) {
        sx_.paddingLeft = `${pl}px`;
    }


    if (mt !== undefined) {
        sx_.marginTop = `${mt}px`;
    }

    if (pt !== undefined) {
        sx_.paddingTop = `${pt}px`;
    }

    if (mb !== undefined) {
        sx_.marginBottom = `${mb}px`;
    }

    if (pb !== undefined) {
        sx_.paddingBottom = `${pb}px`;
    }

    if (row) {
        sx_.display = 'flex'; // Set display to flex
        sx_.flexDirection = 'row'; // Set flex direction to row
    } else if (column) {
        sx_.display = 'flex'; // Set display to flex
        sx_.flexDirection = 'column'; // Set flex direction to column
    }

    // Handle margin properties
    if (m12) sx_.margin = '12px';
    if (ml12) sx_.marginLeft = '12px';
    if (mt12) sx_.marginTop = '12px';
    if (mr12) sx_.marginRight = '12px';
    if (mb12) sx_.marginBottom = '12px';

    // Handle padding properties
    if (p12) sx_.padding = '12px';
    if (pl12) sx_.paddingLeft = '12px';
    if (pt12) sx_.paddingTop = '12px';
    if (pr12) sx_.paddingRight = '12px';
    if (pb12) sx_.paddingBottom = '12px';
    if (ph8) {
        // Horizontal padding
        sx_.paddingLeft = '8px';
        sx_.paddingRight = '8px';
    }
    if (pv8 !== undefined) {
        // Vertical padding
        sx_.paddingTop = '8px';
        sx_.paddingBottom = '8px';
    }
    if (center) {
        sx_.display = 'flex';
        sx_.alignItems = 'center';
        sx_.justifyContent = 'center';
    }
    if (jCenter) {
        sx_.justifyContent = 'center';
    }

    if (fWrap) {
        sx_.flexWrap = 'wrap';
    }

    if (jStart) {
        sx_.justifyContent = 'flex-start';
    }

    if (jEnd) {
        sx_.justifyContent = 'flex-end';
    }

    if (jSpaceBetween) {
        sx_.justifyContent = 'space-between';
    }

    if (jSpaceAround) {
        sx_.justifyContent = 'space-around';
    }

    if (aStart) {
        sx_.alignItems = 'flex-start';
    }

    if (aEnd) {
        sx_.alignItems = 'flex-end';
    }

    if (aCenter) {
        sx_.alignItems = 'center';
    }

    if (zIdx !== undefined) {
        sx_.zIndex = zIdx;
    }

    if (opacity !== undefined) {
        sx_.opacity = opacity;
    }

    if (overflowYAuto) {
        sx_.overflowY = 'auto';
    }

    if (overflowHidden) {
        sx_.overflow = 'hidden';
    }
    if (displayNone) {
        sx_.display = 'none';
    }
    if(!sx){
        sx = {}
    }
    if (red) {
        //@ts-ignore
        sx.bgcolor = 'red';
    } else if (blue) {
        //@ts-ignore
        sx.bgcolor = 'blue';
    }

    if(bgColor){
        //@ts-ignore
        sx.bgcolor = bgColor;
    }

    return {
        ...props_,
        //@ts-ignore
        sx: { ...sx, ...sx_}
    };
}
