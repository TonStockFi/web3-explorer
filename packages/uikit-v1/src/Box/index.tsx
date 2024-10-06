import React from 'react';
import DevBoxWrap from './DevBoxWrap';
import { BoxProps } from './types';

export const Box = ({
    ref,
    zIndex,
    hide,
    cursor,
    button,
    select,
    input,
    selected,
    display,
    wh,
    row,
    column,
    flex,
    width,
    height,
    red,
    blue,
    yellow,
    p10,
    m10,
    mb,
    mr,
    mt,
    mt12,
    mb12,
    mr12,
    ml12,
    pt12,
    pb12,
    pr12,
    pl12,
    center,
    overflow,
    overflowX,
    overflowY,
    backgroundColor,
    textAlign,
    justifyContent,
    alignItems,
    children,
    text,
    style,
    devBox,
    position,
    inset,
    top,
    bottom,
    left,
    right,
    transition,
    padding,
    margin,
    onClick,
    onChange,
    onMouseMove,
    opacity,
    borderRadius,
    userSelect,
    ...props
}: BoxProps) => {
    const _style = {
        userSelect,
        borderRadius,
        backgroundColor,
        textAlign,
        cursor,
        transition,
        zIndex,
        onMouseMove,
        ...style
    };

    if (row) {
        Object.assign(_style, {
            display: 'flex',
            flexDirection: 'row'
        });
    }

    if (column) {
        Object.assign(_style, {
            display: 'flex',
            flexDirection: 'column'
        });
    }

    if (flex !== undefined) {
        if (flex !== true) {
            Object.assign(_style, {
                display: 'flex',
                flex
            });
        } else {
            Object.assign(_style, {
                display: 'flex'
            });
        }
    }

    if (opacity !== undefined) {
        if (opacity > 10) {
            opacity = opacity / 100;
        } else if (opacity > 0) {
            opacity = opacity / 10;
        }
        Object.assign(_style, {
            opacity
        });
    }

    if (padding !== undefined) {
        Object.assign(_style, {
            padding
        });
    } else {
        if (button) {
            Object.assign(_style, {
                padding: '4px 4px'
            });
        }
    }

    if (margin !== undefined) {
        Object.assign(_style, {
            margin
        });
    }
    if (inset !== undefined) {
        Object.assign(_style, {
            inset
        });
    }

    if (top !== undefined) {
        Object.assign(_style, {
            top
        });
    }

    if (bottom !== undefined) {
        Object.assign(_style, {
            bottom
        });
    }
    if (overflow !== undefined) {
        Object.assign(_style, {
            overflow
        });
    }

    if (overflowX !== undefined) {
        Object.assign(_style, {
            overflowX
        });
    }

    if (overflowY !== undefined) {
        Object.assign(_style, {
            overflowY
        });
    }
    if (left !== undefined) {
        Object.assign(_style, {
            left
        });
    }

    if (right !== undefined) {
        Object.assign(_style, {
            right
        });
    }

    if (position) {
        Object.assign(_style, {
            position
        });
    }
    if (mb !== undefined) {
        Object.assign(_style, {
            marginBottom: mb
        });
    }

    if (mr !== undefined) {
        Object.assign(_style, {
            marginRight: mr
        });
    }

    if (mt !== undefined) {
        Object.assign(_style, {
            marginTop: mt
        });
    }

    if (mr12 !== undefined) {
        Object.assign(_style, {
            marginRight: 12
        });
    }

    if (ml12 !== undefined) {
        Object.assign(_style, {
            marginLeft: 12
        });
    }

    if (mt12 !== undefined) {
        Object.assign(_style, {
            marginTop: 12
        });
    }

    if (mb12 !== undefined) {
        Object.assign(_style, {
            marginBottom: 12
        });
    }

    if (pr12 !== undefined) {
        Object.assign(_style, {
            paddingRight: 12
        });
    }

    if (pl12 !== undefined) {
        Object.assign(_style, {
            paddingLeft: 12
        });
    }

    if (pt12 !== undefined) {
        Object.assign(_style, {
            paddingTop: 12
        });
    }

    if (pb12 !== undefined) {
        Object.assign(_style, {
            paddingBottom: 12
        });
    }
    if (p10 !== undefined) {
        Object.assign(_style, {
            padding: 10
        });
    }

    if (m10 !== undefined) {
        Object.assign(_style, {
            margin: 10
        });
    }
    if (yellow) {
        Object.assign(_style, {
            backgroundColor: 'yellow'
        });
    }

    if (blue) {
        Object.assign(_style, {
            backgroundColor: 'blue'
        });
    }

    if (red) {
        Object.assign(_style, {
            backgroundColor: 'red'
        });
    }
    if (height !== undefined) {
        Object.assign(_style, {
            height
        });
    }

    if (width !== undefined) {
        Object.assign(_style, {
            width
        });
    }
    if (wh !== undefined) {
        Object.assign(_style, {
            width: wh,
            height: wh
        });
    }
    if (justifyContent) {
        Object.assign(_style, {
            justifyContent,
            display: 'flex'
        });
    }
    if (alignItems) {
        Object.assign(_style, {
            alignItems,
            display: 'flex'
        });
    }
    if (center) {
        Object.assign(_style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });
    }
    if (_style.display === undefined) {
        Object.assign(_style, { display: 'flex' });
    }
    if (_style.display === 'flex' && column === undefined) {
        Object.assign(_style, { flexDirection: 'row' });
    }
    if (_style.display === 'flex' && alignItems === undefined) {
        Object.assign(_style, { alignItems: 'center' });
    }
    if (display !== undefined) {
        Object.assign(_style, {
            display
        });
    }
    if (_style.fontSize === undefined) {
        Object.assign(_style, {
            fontSize: '14px'
        });
    }
    Object.assign(_style, {
        ...style
    });
    if (hide) {
        return null;
    }
    let node;
    if (button) {
        node = (
            <button ref={ref} onClick={onClick} style={_style} {...props}>
                {children || text || ''}
            </button>
        );
    } else if (select) {
        node = (
            <select
                value={selected}
                ref={ref}
                onChange={onChange ? e => onChange(e.target.value, e) : undefined}
                style={_style}
                {...props}
            >
                {select.map(row => {
                    return (
                        <option key={row.value} value={row.value}>
                            {row.text || row.value}
                        </option>
                    );
                })}
            </select>
        );
    } else if (input) {
        node = (
            <div style={_style} {...props}>
                {text && (
                    <label style={{ marginRight: 8, width: input.labelWidth || undefined }}>
                        {text}
                    </label>
                )}
                {((input, onChange) => {
                    delete input.labelWidth;
                    // @ts-ignore
                    const style = { display: 'flex', flex: 1, width: '100%', ...input.style };
                    // @ts-ignore
                    let onChange1 = onChange
                        ? (e: any) => {
                              if (e.target.type === 'checkbox') {
                                  onChange(e.target.checked, e);
                              } else {
                                  const value = e.target.value;
                                  onChange(e.target.type === 'number' ? parseInt(value) : value, e);
                              }
                          }
                        : undefined;

                    const props: any = {
                        ref,
                        onChange: onChange1,
                        ...input,
                        style
                    };
                    return <input {...props} />;
                })(input, onChange)}
            </div>
        );
    } else {
        node = (
            <div ref={ref} onClick={onClick} style={_style} {...props}>
                {children || text || ''}
            </div>
        );
    }

    if (devBox) {
        return <DevBoxWrap devBox={devBox!}>{node}</DevBoxWrap>;
    } else {
        return node;
    }
};
