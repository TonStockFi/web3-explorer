import { useState } from "react";
import { FinalView } from "./Password";
import { WalletBatchCreateNumber } from "../../components/create/WalletBatchCreateNumber";
import { WalletBatchCreating } from "../../components/create/WalletBatchCreating";

const CreateBatch = () => {

    const [genCount, setGenCount] = useState<number|null>(null);
    const [genBatchMemLoading, setGenBatchMemLoading] = useState(false);

    if (!genCount) {
        return (
          <WalletBatchCreateNumber
            submitHandler={async ({count})=>{
                setGenCount(count);
                setGenBatchMemLoading(true);
            }}/>
        )
    }

    if (genBatchMemLoading) {
        return (
          <WalletBatchCreating
            count={genCount}
            onFinish={()=>{
                setGenBatchMemLoading(false)
            }}
          />
        )
    }
    return <FinalView />;
};

export default CreateBatch;
