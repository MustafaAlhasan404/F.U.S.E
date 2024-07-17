import numpy as np
import pandas as pd
from sklearn.utils import shuffle

class DataGenerator:
    def __init__(self, file_path, batch_size=32, shuffle=True):
        self.file_path = file_path
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.data = pd.read_csv(file_path)
        self.indices = np.arange(len(self.data))
        self.on_epoch_end()

    def len(self):
        return int(np.floor(len(self.data) / self.batch_size))

    def get_item__(self, index):
        batch_indices = self.indices[index * self.batch_size:(index + 1) * self.batch_size]
        batch_data = self.data.iloc[batch_indices]
        X, y = self.__data_generation(batch_data)
        return X, y

    def on_epoch_end(self):
        if self.shuffle:
            np.random.shuffle(self.indices)

    def data_generation(self, batch_data):
        categorical_features = ['Payment Method', 'Category']
        encoder = ce.BinaryEncoder(cols=categorical_features)
        df_encoded = encoder.fit_transform(batch_data[categorical_features])
        
        batch_data = batch_data.drop(columns=categorical_features)
        batch_data = pd.concat([batch_data, df_encoded], axis=1)
        
        batch_data['Is Fraud?'] = batch_data['Is Fraud?'].apply(lambda x: 1 if x == 'Yes' else 0)
        
        X = batch_data.drop(columns=['Is Fraud?']).values
        y = batch_data['Is Fraud?'].values
        return X, y