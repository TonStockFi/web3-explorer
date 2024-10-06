import * as React from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import DevicesIcon from '@mui/icons-material/Devices';
import MenuIcon from '@mui/icons-material/Menu';

import { View } from '@web3-explorer/uikit-view';

export type ViewType = "LOGIN"|"MENU"|"DEVICE"|"SEND"

export default function VerticalToggleButtons() {

    const [view, setView] = React.useState<ViewType>("LOGIN");

    const handleChange = (event: React.MouseEvent<HTMLElement>, nextView:ViewType) => {
        setView(nextView);
    };

    const items =
        [
            {
                value: 'LOGIN',
                onClick:()=>{alert("Login")},
                icon:<AddIcon />
            },
            {
                value: 'MENU',
                icon:<MenuIcon />
            },

            {
                value: 'DEVICE',
                icon:<DevicesIcon />
            },

        ]
    return (
        <View w100p h={"800px"} rel>
            <View abs x={0} y={0} w={"64px"} h100p sx={{bgcolor:"#f9f9f9"}}>
                <View column sx={{alignItems:"center"}} w100p h100p>
                    <ToggleButtonGroup
                        sx={{width:"100%"}}
                        orientation="vertical"
                        value={view}
                        exclusive
                        onChange={handleChange}
                    >
                        {
                            items.map(({onClick,value,icon}:any,index:number)=>{
                                return (
                                    <ToggleButton key={index} sx={{py:2.5,borderRadius:0,border:"none"}} onClick={onClick ? onClick : ()=>{setView(value)}} value={value} aria-label={value}>
                                        {icon}
                                    </ToggleButton>
                                )
                            })
                        }
                    </ToggleButtonGroup>
                </View>
            </View>
        </View>
    );
}
