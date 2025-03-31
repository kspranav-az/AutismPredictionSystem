import tensorflow as tf
import keras
print(f"TensorFlow Version: {tf.__version__}")
print(f"Keras Version: {keras.__version__}")
print(tf.config.list_physical_devices('GPU'))
