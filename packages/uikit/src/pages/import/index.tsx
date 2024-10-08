import { Route, Routes } from 'react-router-dom';
import { ImportRoute } from '../../libs/routes';
import CreateBatch from './CreateBatch';

const ImportRouter = () => {
    return (
        <Routes>
            <Route path={ImportRoute.createBatch} element={<CreateBatch />} />
        </Routes>
    );
};

export default ImportRouter;
