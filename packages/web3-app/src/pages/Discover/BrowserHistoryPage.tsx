import { useTranslation } from '@web3-explorer/lib-translation';
import CardContent from '@web3-explorer/uikit-mui/dist/mui/CardContent';
import CardHeader from '@web3-explorer/uikit-mui/dist/mui/CardHeader';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { formatTs } from '../../common/utils';
import { SiteFavoricoView } from '../../components/app/SiteFavoricoView';
import { Page } from '../../components/Page';
import { DISCOVER_HOST } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import BrowserHistoryService, { BrowserHistoryProps } from '../../services/BrowserHistoryService';

export function BrowserHistoryPage() {
    const [rows, setRows] = useState<BrowserHistoryProps[]>([]);
    const { openUrl } = useBrowserContext();
    const [searchVal, setSearchVal] = useState('');
    useEffect(() => {
        BrowserHistoryService.getAll().then(rows => {
            rows.sort((a, b) => b.ts - a.ts);
            setRows(rows);
        });
    }, []);
    const theme = useTheme();
    const { t } = useTranslation();
    let rows1 = rows.filter(row => Boolean(row.url.toLowerCase().indexOf(DISCOVER_HOST) === -1));
    if (searchVal) {
        rows1 = rows.filter(row =>
            Boolean(row.url.toLowerCase().indexOf(searchVal.toLowerCase()) > -1)
        );

        rows1 = rows.filter(row =>
            Boolean(
                (row.title && row.title.toLowerCase().indexOf(searchVal.toLowerCase()) > -1) ||
                    (row.desc && row.desc.toLowerCase().indexOf(searchVal.toLowerCase()) > -1)
            )
        );
    }
    const groupByDay = (rows: BrowserHistoryProps[]): Record<string, BrowserHistoryProps[]> => {
        return rows.reduce((acc, row) => {
            const date = new Date(row.ts).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(row);
            return acc;
        }, {} as Record<string, BrowserHistoryProps[]>);
    };

    const groupedRows = groupByDay(rows1);
    const [showSearchIcon, setShowSearchIcon] = useState(true);
    return (
        <Page
            header={
                <View flex1 borderBox px={24} rowVCenter>
                    <View center hide={showSearchIcon} w100p>
                        <TextField
                            value={searchVal}
                            onBlur={() => {
                                if (searchVal.length === 0) setShowSearchIcon(true);
                            }}
                            onChange={e => {
                                setSearchVal(e.target.value);
                            }}
                            placeholder={t('SearchBrowserHistory')}
                            size="small"
                            sx={{ width: `90%` }}
                            slotProps={{
                                input: {
                                    startAdornment: <View icon="Search" />,
                                    sx: {
                                        borderRadius: '14px',
                                        '& .MuiInputBase-input ': {
                                            py: '7px',
                                            fontSize: '1rem'
                                        }
                                    },
                                    type: 'search'
                                }
                            }}
                        />
                    </View>
                    <View hide={!showSearchIcon} w100p rowVCenter jEnd>
                        <View
                            icon="Search"
                            onClick={() => setShowSearchIcon(false)}
                            iconButtonSmall
                        />
                    </View>
                </View>
            }
        >
            <View h100p overflowYAuto>
                <View column pt12 width={800} sx={{ margin: '0 auto' }}>
                    {Object.entries(groupedRows).map(([date, rows]) => (
                        <View card key={date} mb12>
                            <CardHeader title={date} mb={4} />
                            <CardContent>
                                {rows.map(row => {
                                    const { ts, url, title, id } = row as BrowserHistoryProps;
                                    return (
                                        <View mb12 px={12} key={id}>
                                            <View
                                                borderBox
                                                pointer
                                                onClick={() => {
                                                    openUrl(url);
                                                }}
                                                wh100p
                                                py={8}
                                                px={8}
                                                row
                                                jStart
                                                aCenter
                                                borderRadius={8}
                                                hoverBgColor={theme.backgroundContent}
                                            >
                                                <View
                                                    w={60}
                                                    mr12
                                                    text={formatTs(ts)}
                                                    textFontSize="0.8rem"
                                                />

                                                <View flex1 row jStart aCenter>
                                                    <SiteFavoricoView url={url} title={title} />
                                                    <View aCenter tips={url}>
                                                        <View h={24} overflowHidden text={title} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </CardContent>
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    );
}
