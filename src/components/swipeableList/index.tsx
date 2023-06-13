import React, {useEffect} from 'react';
import {BackHandler, ScrollView} from 'react-native';
import Item from './item';

interface SwipeableListProps {
  data: any[];
  edit?: boolean;
  onEdit?: (isEdit: boolean) => void;
}
export default function SwipeableList(props: SwipeableListProps) {
  const {data, edit = false, onEdit} = props;
  const [swiping, setSwiping] = React.useState<boolean>(false);
  // const [edit, setEdit] = React.useState<boolean>(false);

  const cleanFromScreen = (_id: any) => {};

  useEffect(() => {
    const backAction = () => {
      if (edit) {
        onEdit?.(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [edit, onEdit]);

  const renderItems = () => {
    return data.map(item => {
      return (
        <Item
          isEdit={edit}
          onStartEdit={onEdit}
          key={item.id}
          swipingCheck={(_swiping: boolean) => setSwiping(_swiping)}
          // message={item.message}
          id={item.id}
          cleanFromScreen={(id: any) => cleanFromScreen(id)}
          leftButtonPressed={type => console.log('type', type)}
          deleteButtonPressed={() => console.log('delete button pressed')}
          editButtonPressed={() => console.log('edit button pressed')}
        />
      );
    });
  };
  return <ScrollView scrollEnabled={!swiping}>{renderItems()}</ScrollView>;
}
